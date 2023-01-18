# SafeData

<a href="https://www.npmjs.com/package/safe-data">
  <img alt="npm" src="https://badgen.net/npm/node/next" />
</a>
<a href="https://www.npmjs.com/package/safe-data">
  <img alt="npm" src="https://badgen.net/npm/v/safe-data" />
</a>
<a href="https://www.npmjs.com/package/safe-data">
  <img alt="npm" src="https://badgen.net/npm/types/safe-data" />
</a>

A simple schema-based validation library for typescript and javascript.

## Getting started

```
npm install safe-data
```

`safe-data` lets you describe your data using declarative schema:

```ts
import { schema } from 'safe-data';

const repositorySchema = schema.object({
  id: schema.number().int().min(1),
  name: schema.string().notEmpty(),
  description: schema.string().optional(),
  environment: schema.enum(['prod', 'dev', 'test'] as const),
  isPrivate: schema.boolean(),
  issues: schema.array(schema.object({
    author: schema.string(),
    body: schema.string(),
  })),
});

type Repository = schema.infer<typeof repositorySchema>;
// Repository inferred type:
//   {
//     id: number;
//     name: string;
//     description: string | undefined;
//     environment: 'prod' | 'dev' | 'test';
//     isPrivate: boolean;
//     issues: {
//       author: string;
//       body: string;
//     }[]
//   }

try {
  // repo: Repository
  const repo = repositorySchema.parse({
    id: 7,
    name: 'test-project',
    environment: 'dev',
    isPrivate: false,
    issues: [],
  });
} catch (err) {}
```
