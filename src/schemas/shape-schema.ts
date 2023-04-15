import { AnySchema, InferOutput, WithOptionalAttrs } from '../types.js';
import { RequiredErrorMessage, Rule, Schema, TypeErrorMessage } from './schema.js';
import { ValidationError } from '../validation-error.js';
import { formatList } from '../utils/format-list.js';
import { errorCodes } from '../error-codes.js';

type Props = {
  [key: string]: AnySchema;
};
type Shape<T extends Props> = WithOptionalAttrs<{
  [K in keyof T]: InferOutput<T[K]>;
}>;
type ShapeRule<T extends Props> = Rule<Shape<T>>;
type ShapeRules<T extends Props> = ShapeRule<T>[];

const isObject = (value: unknown): value is Record<string, unknown> => (
  value != null && typeof value === 'object'
);

export class ShapeSchema<T extends Props> extends Schema<Shape<T>> {
  protected readonly _props: T;

  constructor(
    props: T,
    rules?: ShapeRules<T>,
    typeError?: TypeErrorMessage,
    requiredError?: RequiredErrorMessage,
  ) {
    super(rules, typeError, requiredError);
    this._props = props;
  }

  protected _validate(maybeObject: unknown): Shape<T> {
    if (!isObject(maybeObject)) {
      this._throwTypeError(maybeObject, 'object');
    }

    const object: Record<string, unknown> = {};
    const errors = new Map<string, ValidationError>();
    const propsSchema = this._props;
    for (const key of Object.keys(propsSchema)) {
      try {
        const value = maybeObject[key];
        const schema = propsSchema[key];
        object[key] = schema.validate(value);
      } catch (e) {
        const error = ValidationError.from(e);
        error.path.unshift(key);
        errors.set(key, error);
      }
    }

    if (errors.size > 0) {
      const invalidProps: string[] = [];
      const subErrors: ValidationError[] = [];
      errors.forEach((error, key) => {
        invalidProps.push(`'${key}'`);
        subErrors.push(error);
      });

      const message = invalidProps.length > 1
        ? `The object has invalid properties ${formatList(invalidProps)}.`
        : `The object has invalid property ${invalidProps[0]}.`;
      throw new ValidationError(message, {
        subErrors,
        code: errorCodes.invalidObjectShape,
      });
    }

    return object as Shape<T>;
  }

  get<P extends keyof T>(name: P) {
    if (!(name in this._props)) {
      throw new Error(`A property '${String(name)}' does not exist.`);
    }
    return this._props[name];
  }
}

export type ShapeSchemaOptions<T extends Props> = {
  rules?: ShapeRules<T>;
  typeError?: TypeErrorMessage;
  requiredError?: RequiredErrorMessage;
};

export function createShapeSchema<T extends Props>(
  props: T,
  options?: ShapeSchemaOptions<T>,
) {
  return new ShapeSchema(
    props,
    options?.rules,
    options?.typeError,
    options?.requiredError,
  );
}
