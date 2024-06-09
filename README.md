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

**safe-data** is a simple library for data validation and parsing.

## Installation

```bash
npm install --save safe-data
```

## Basic usage

```js
import { validator } from 'safe-data';

enum Priority {
  low = 'low',
  medium = 'medium',
  high = 'high',
};

type Task = {
  name: string;
  note: string;
  tags: string[];
  priority: Priority;
  completed?: boolean;
  completedAt?: Date | null;
};

const taskValidator = validator.shape<Task>({
  name: validator.string().notEmpty({ ignoreWhitespace: true }),
  note: validator.string(),
  tags: validator.array(validator.string().pattern(/^#[a-z]+/i)),
  priority: validator.enum(Priority),
  completed: validator.boolean().optional(),
  completedAt: validator.date().optionalOrNullable(),
});

// Use the task validator to validate data.
// E.g. check HTML form data...
const form = document.getElementById('task-form');
const formData = new FormData(form);
const result = taskValidator.validate({
  name: formData.get('name'),
  note: formData.get('note'),
  tags: formData.get('tags'),
  priority: formData.get('priority'),
});
if (result.ok) {
  saveTask(result.value);
} else {
  console.warn('Invalid task data:', result.error);
}

// ...or a server response.
fetchTask()
  .then((res) => taskValidator.parse(res))
  .catch((error) => console.error(error));
```

### Optional and null values

All validators are required by default. However, you can use:
- `optional()` method to accept `undefined`,
- `nullable()` method to accept `null`,
- `optionalOrNullable()` method to accept `undefined` and `null`.
