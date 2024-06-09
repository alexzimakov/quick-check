export class ValidationError extends Error {
  readonly code: string;
  readonly message: string;
  readonly details: object;
  constructor(props: {
    code: string;
    message: string;
    details?: object;
  }) {
    super(props.message);
    this.name = 'ValidationError';
    this.stack = undefined;
    this.code = props.code;
    this.message = props.message;
    this.details = props.details || {};
  }

  static Code = Object.freeze({
    VALUE_MISSING: 'VALUE_MISSING',
    VALUE_EMPTY: 'VALUE_EMPTY',
    BOOLEAN_EXPECTED: 'BOOLEAN_EXPECTED',
    NUMBER_EXPECTED: 'NUMBER_EXPECTED',
    STRING_EXPECTED: 'STRING_EXPECTED',
    INT_EXPECTED: 'INT_EXPECTED',
    BIGINT_EXPECTED: 'BIGINT_EXPECTED',
    ARRAY_EXPECTED: 'ARRAY_EXPECTED',
    OBJECT_EXPECTED: 'OBJECT_EXPECTED',
    INVALID_ENUM_VALUE: 'INVALID_ENUM_VALUE',
    INVALID_ARRAY_ITEMS: 'INVALID_ARRAY_ITEMS',
    INVALID_ISO_DATE: 'INVALID_ISO_DATE',
    INVALID_ISO_TIME: 'INVALID_ISO_TIME',
    INVALID_ISO_DATE_TIME: 'INVALID_ISO_DATE_TIME',
    ARRAY_UNIQUE: 'ARRAY_UNIQUE',
    INVALID_OBJECT_SHAPE: 'INVALID_OBJECT_SHAPE',
    INVALID_INSTANCE_TYPE: 'INVALID_INSTANCE_TYPE',
    PROPERTY_MISSING: 'PROPERTY_MISSING',
    PROPERTY_INVALID: 'PROPERTY_INVALID',
    PROPERTY_VALUE_INVALID: 'PROPERTY_VALUE_INVALID',
    TOO_LONG: 'TOO_LONG',
    TOO_SHORT: 'TOO_SHORT',
    TOO_LARGE: 'TOO_LARGE',
    TOO_SMALL: 'TOO_SMALL',
    OUT_OF_RANGE: 'OUT_OF_RANGE',
    STEP_MISMATCH: 'STEP_MISMATCH',
    PATTERN_MISMATCH: 'PATTERN_MISMATCH',
    DAYS_MISMATCH: 'DAYS_MISMATCH',
    UNION_ERROR: 'UNION_ERROR',
    CUSTOM_ERROR: 'CUSTOM_ERROR',
  });
}
