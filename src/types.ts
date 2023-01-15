// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Mapper = (value: any) => any;

export type FormatMessage<T> = (params: T) => string;
