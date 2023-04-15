import { expect, test } from 'vitest';
import { formatMessage } from './format-message.js';

test('returns a given value when `message` argument is a string', () => {
  expect(formatMessage('', {})).toBe('');
  expect(formatMessage('unknown error', {})).toBe('unknown error');
});

test('returns formatted message when `message` argument is a function', () => {
  expect(
    formatMessage(() => 'unknown error', {}),
  ).toBe('unknown error');
  expect(formatMessage(
    (params: { value: string }) => `${params.value} is invalid`,
    { value: 'foo' },
  )).toBe('foo is invalid');
});
