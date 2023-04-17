import { assertType } from 'vitest';
import { InferInput, InferOutput, schema } from './safe-data.js';

class CustomType {
  readonly __type = Symbol('CustomType');

  static create() {
    return new CustomType();
  }
}
const customType = CustomType.create();

const stringType = schema.string();
const stringCustomType = stringType.transform(CustomType.create);
assertType<InferInput<typeof stringType>>('');
assertType<InferOutput<typeof stringType>>('');
assertType<InferInput<typeof stringCustomType>>('');
assertType<InferOutput<typeof stringCustomType>>(customType);

const numberType = schema.number();
const numberCustomType = numberType.transform(CustomType.create);
assertType<InferInput<typeof numberType>>(0);
assertType<InferOutput<typeof numberType>>(0);
assertType<InferInput<typeof numberCustomType>>(0);
assertType<InferOutput<typeof numberCustomType>>(customType);

const bigintType = schema.bigint();
const bigintCustomType = bigintType.transform(CustomType.create);
assertType<InferInput<typeof bigintType>>(0n);
assertType<InferOutput<typeof bigintType>>(0n);
assertType<InferInput<typeof bigintCustomType>>(0n);
assertType<InferOutput<typeof bigintCustomType>>(customType);

const booleanType = schema.boolean();
const booleanCustomType = booleanType.transform(CustomType.create);
assertType<InferInput<typeof booleanType>>(false);
assertType<InferOutput<typeof booleanType>>(false);
assertType<InferInput<typeof booleanCustomType>>(false);
assertType<InferOutput<typeof booleanCustomType>>(customType);

const enumType = schema.enum(['a', 'b', 'c']);
const enumCustomType = enumType.transform(CustomType.create);
assertType<InferInput<typeof enumType>>('b');
assertType<InferOutput<typeof enumType>>('b');
assertType<InferInput<typeof enumCustomType>>('b');
assertType<InferOutput<typeof enumCustomType>>(customType);

const arrayType = schema.array({ item: stringType });
const arrayCustomType = arrayType.transform(CustomType.create);
assertType<InferInput<typeof arrayType>>(['']);
assertType<InferOutput<typeof arrayType>>(['']);
assertType<InferInput<typeof arrayCustomType>>(['']);
assertType<InferOutput<typeof arrayCustomType>>(customType);

const objectType = schema.object({
  key: schema.enum(['a', 'b', 'c']),
  value: schema.number(),
});
const objectCustomType = objectType.transform(CustomType.create);
assertType<InferInput<typeof objectType>>({ b: 2 });
assertType<InferOutput<typeof objectType>>({ b: 2 });
assertType<InferInput<typeof objectCustomType>>({ b: 2 });
assertType<InferOutput<typeof objectCustomType>>(customType);

const instanceType = schema.instanceOf(Date);
const instanceCustomType = instanceType.transform(CustomType.create);
assertType<InferInput<typeof instanceType>>(new Date());
assertType<InferOutput<typeof instanceType>>(new Date());
assertType<InferInput<typeof instanceCustomType>>(new Date());
assertType<InferOutput<typeof instanceCustomType>>(customType);

const shapeType = schema.shape({
  isActive: schema.boolean(),
  name: schema.string(),
  birthday: schema.string().transform((str) => new Date(str)),
});
const shapeCustomType = shapeType.transform(CustomType.create);
assertType<InferInput<typeof shapeType>>({
  isActive: false,
  name: 'John Doe',
  birthday: '1970-01-01',
});
assertType<InferOutput<typeof shapeType>>({
  isActive: false,
  name: 'John Doe',
  birthday: new Date('1970-01-01'),
});
assertType<InferInput<typeof shapeCustomType>>({
  isActive: false,
  name: 'John Doe',
  birthday: '1970-01-01',
});
assertType<InferOutput<typeof shapeCustomType>>(customType);

const unionType = schema.union([
  schema.number(),
  schema.string().transform((str) => new Date(str)),
]);
const unionCustomType = unionType.transform(CustomType.create);
assertType<InferInput<typeof unionType>>(0);
assertType<InferInput<typeof unionType>>('');
assertType<InferOutput<typeof unionType>>(0);
assertType<InferOutput<typeof unionType>>(new Date());
assertType<InferInput<typeof unionCustomType>>(0);
assertType<InferInput<typeof unionCustomType>>('');
assertType<InferOutput<typeof unionCustomType>>(customType);

const typeA = schema.string();
const typeB = typeA.transform((str) => new Date(str));
const typeC = typeA.transform(() => CustomType.create());
assertType<InferInput<typeof typeA>>('');
assertType<InferOutput<typeof typeA>>('');
assertType<InferInput<typeof typeB>>('');
assertType<InferOutput<typeof typeB>>(new Date());
assertType<InferInput<typeof typeC>>('');
assertType<InferOutput<typeof typeC>>(customType);

const nullableCustomType = schema.string()
  .transform(CustomType.create)
  .nullable();
assertType<InferInput<typeof nullableCustomType>>('');
assertType<InferInput<typeof nullableCustomType>>(null);
assertType<InferOutput<typeof nullableCustomType>>(customType);

const optionalCustomType = schema.string()
  .transform(CustomType.create)
  .optional();
assertType<InferInput<typeof optionalCustomType>>('');
assertType<InferInput<typeof optionalCustomType>>(undefined);
assertType<InferOutput<typeof optionalCustomType>>(customType);

const nullishCustomType = schema.string()
  .transform(CustomType.create)
  .nullish();
assertType<InferInput<typeof nullishCustomType>>('');
assertType<InferInput<typeof nullishCustomType>>(null);
assertType<InferInput<typeof nullishCustomType>>(undefined);
assertType<InferOutput<typeof nullishCustomType>>(customType);
