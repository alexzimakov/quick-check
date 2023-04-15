export type MessageFormatter<T> = (params: T) => string;
export type Message<T> = string | MessageFormatter<T>;

export function formatMessage<T>(
  message: Message<T>,
  params: T,
): string {
  if (typeof message === 'function') {
    return message(params);
  }
  return message;
}
