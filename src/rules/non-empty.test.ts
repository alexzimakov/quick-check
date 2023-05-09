import { describe, expect, test, vi } from 'vitest';
import { nonEmpty } from './non-empty.js';
import { ValidationError } from '../validation-error.js';

describe('positive cases', () => {
  describe('not ignore whitespace characters', () => {
    const values: [string, string][] = [
      ['only whitespace characters', ' \t\n'],
      ['with whitespace characters', ' \tabc\n'],
      ['plaintext', 'abc'],
    ];
    const checkNonEmpty = nonEmpty();
    values.forEach(([name, value]) => {
      test(name, () => {
        expect(() => checkNonEmpty(value)).not.toThrow();
      });
    });
  });

  describe('ignore whitespace characters', () => {
    const values: [string, string][] = [
      ['with whitespace characters', ' \tabc\n'],
      ['plaintext', 'abc'],
    ];
    const checkNonEmpty = nonEmpty({ ignoreWhitespace: true });
    values.forEach(([name, value]) => {
      test(name, () => {
        expect(() => checkNonEmpty(value)).not.toThrow();
      });
    });
  });
});

describe('negative cases', () => {
  describe('not ignore whitespace characters', () => {
    const values: [string, string][] = [
      ['empty string', ''],
    ];
    const checkNonEmpty = nonEmpty();
    values.forEach(([name, value]) => {
      test(name, () => {
        expect(() => checkNonEmpty(value)).toThrow(ValidationError);
      });
    });
  });

  describe('ignore whitespace characters', () => {
    const values: [string, string][] = [
      ['only whitespace characters', ' \t\n'],
      ['empty string', ''],
    ];
    const checkNonEmpty = nonEmpty({ ignoreWhitespace: true });
    values.forEach(([name, value]) => {
      test(name, () => {
        expect(() => checkNonEmpty(value)).toThrow(ValidationError);
      });
    });
  });
});

test('should throw an error with custom message', () => {
  const message = 'invalid value';
  const checkNonEmpty = nonEmpty({ message, ignoreWhitespace: false });
  expect(() => checkNonEmpty('')).toThrow(message);
});

test('should throw an error with formatted message', () => {
  const value = '\t\n';
  const ignoreWhitespace = true;
  const message = 'invalid value';
  const messageFormatter = vi.fn(() => message);
  const checkNonEmpty = nonEmpty({
    ignoreWhitespace,
    message: messageFormatter,
  });
  expect(() => checkNonEmpty(value)).toThrow(message);
  expect(messageFormatter).toHaveBeenCalledWith({ value, ignoreWhitespace });
});
