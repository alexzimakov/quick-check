import { TypeAlias } from './type-aliases/type-alias.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResultMapper = (value: any) => any;

export type InputType<T extends TypeAlias<unknown>> = T['__result'];

export type OutputType<T extends TypeAlias<unknown>> = T['__mapped'];
