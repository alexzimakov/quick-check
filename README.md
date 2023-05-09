# safe-data

<a href="https://www.npmjs.com/package/safe-data">
  <img alt="npm" src="https://badgen.net/npm/node/next" />
</a>
<a href="https://www.npmjs.com/package/safe-data">
  <img alt="npm" src="https://badgen.net/npm/v/safe-data" />
</a>
<a href="https://www.npmjs.com/package/safe-data">
  <img alt="npm" src="https://badgen.net/npm/types/safe-data" />
</a>
<a href="https://bundlephobia.com/package/safe-data">
  <img alt="npm" src="https://badgen.net/bundlephobia/minzip/safe-data" />
</a>

**safe-data** is a simple schema-based library for data parsing and validating.

## Installation

```bash
npm install --save safe-data
```

## Basic usage

```js
import { schema, rules } from 'safe-data';

// Declare a reminder schema.
const reminderSchema = schema.shape({
  isCompleted: schema.boolean(),
  title: schema.string({
    rules: [
      rules.minLength({ limit: 5 }),
      rules.maxLength({ limit: 64 }),
    ],
  }),
  notes: schema.string().nullish(),
  date: schema.string({
    rules: [rules.isoDatetime()],
  }).transform((value) => new Date(value)),
  priority: schema.enum([
    'low',
    'medium',
    'high',
  ]).optional(),
  tags: schema.array({
    item: schema.string(),
  }),
});

// Use the reminder schema to validate data.
// E.g. check HTML form data...
try {
  const form = document.getElementById('reminder-form');
  const formData = new FormData(form);
  const reminder = reminderSchema.validate({
    title: formData.get('title'),
    notes: formData.get('notes'),
    date: formData.get('date'),
    priority: formData.get('priority'),
    tags: formData.getAll('tags'),
  });
} catch (error) {
  console.error(error);
}
// ...or a server response.
fetchReminder()
  .then(reminderSchema.validate)
  .catch((error) => console.error(error));
```

## Core concepts

The `safe-data` is divided into 2 main logical parts - schemas and rules.
The **schemas** provide a way to validate **core types** - `string`, `number`,
`object`, etc. While **rules** using for **format validation**, for example,
to check that string is a valid URL.

- Schemas are created with `schema` object. Schema instances are immutable.
- Rules are just pure functions that accept a value validated by schema and
  throw an error if the value has an invalid format. You can use built-in
  `safe-data` rules or write yours own.

### Optional and null values

All schemas are required by default. However, you can make use of `optional`,
`nullable`, and `nullish` modifiers to mark schema as optional.

### Null values

You can allow `null` values with `nullable()` method. This method wraps
the original schema to `NullableModifier`. To get the wrapped schema
use `unwrap()` method.

```js
import { schema } from 'safe-data';

const stringSchema = schema.string();
const nullableString = stringSchema.nullable();

nullableString.validate(null); // returns null
nullableString.unwrap() === stringSchema; // true
```

### Optional values

You can allow `undefined` values with `optional()` method. This method wraps
the original schema to `OptionalModifier`. To get the wrapped schema
use `unwrap()` method.

```js
import { schema } from 'safe-data';

const stringSchema = schema.string();
const optionalString = stringSchema.optional();

optionalString.validate(undefined); // returns undefined
optionalString.unwrap() === stringSchema; // true
```

### Null and optional values

You can allow `null` and `undefined` values with `nullish()` method. This method
wraps the original schema to `NullishModifier`. To get the wrapped schema
use `unwrap()` method.

```js
import { schema } from 'safe-data';

const stringSchema = schema.string();
const nullishString = stringSchema.nullable();

nullishString.validate(null); // returns null
nullishString.validate(undefined); // returns undefined
nullishString.unwrap() === stringSchema; // true
```

## Transform value after validation

You can use `transform()` method to transform value after validation.
This method accepts transform function and wraps the original schema
to `ResultTransformer`. To get the source schema use `sourceSchema` property.

```js
import { schema, rules } from 'safe-data';

const isoDateSchema = schema.string({
  rules: [
    rules.isoDate(),
  ],
});
const eventDateSchema = isoDateSchema.transform((value) => new Date(value));

isoDateSchema.validate('2020-08-10'); // returns string
eventDateSchema.validate('2020-08-10'); // returns Date
eventDateSchema.sourceSchema === eventDateSchema;
```

## TypeScript Support

`safe-data` supports TypeScript and ships with types in the library itself.

Also, you can use `InferType` to extract the validation result type.

```ts
import { schema, type InferType } from 'safe-data';

const reminderSchema = schema.shape({
  isCompleted: schema.boolean(),
  title: schema.string(),
  notes: schema.string().nullish(),
  priority: schema.enum(['low', 'medium', 'high'] as const),
});

type Reminder = InferType<typeof reminderSchema>;
// {
//   isCompleted: boolean;
//   title: string;
//   notes?: string | null | undefined;
//   priority: 'low' | 'medium' | 'high';
// }
```

Sometimes you need to get type before any transformations.
For this use an `InferInput` type.

```ts
import { schema, rules, type InferInput } from 'safe-data';

const isoStringSchema = schema.string({
  rules: [
    rules.isoDate(),
  ],
});
const dateSchema = isoStringSchema.transform((value) => new Date(value));

type ISOString = InferInput<typeof dateSchema>; // string
```
