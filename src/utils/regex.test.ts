import { expect, test } from 'vitest';
import { regex } from './regex.js';

test('should merge regular expressions', () => {
  expect(
    regex`${/\w+/}`,
  ).toEqual(/\w+/);

  expect(
    regex`\\d+`,
  ).toEqual(/\d+/);

  expect(
    regex`(${/\p{Number}/u}|${/[a-z]/ui})+`,
  ).toEqual(/(\p{Number}|[a-z])+/iu);
});
