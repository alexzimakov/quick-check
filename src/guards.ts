import {
  type ObjectWithCode,
  type ObjectWithMessage,
  type ObjectWithParams,
} from './types.js';

export function isObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object';
}

export function hasMessage(value: unknown): value is ObjectWithMessage {
  return isObject(value) && typeof value.message === 'string';
}

export function hasCode(value: unknown): value is ObjectWithCode {
  return isObject(value) && typeof value.code === 'string';
}

export function hasParams(value: unknown): value is ObjectWithParams {
  return isObject(value) && isObject(value.params);
}
