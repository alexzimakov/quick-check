import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';
import { regex } from '../utils/regex.js';

export type ISOTimeErrorDetails = {
  value: string;
};

const hour = /(?<hour>2[0-3]|[01][0-9])/;
const minute = /(?<minute>[0-5][0-9])/;
const second = /(?<second>[0-5][0-9])/;
const timeZone = /(?<timeZone>Z|[+-](?:2[0-3]|[01][0-9]:?([0-5][0-9])))/;
const patterns = [
  // HH:mm
  regex`^${hour}:${minute}${timeZone}?$`,
  // HH:mm:ss
  regex`^${hour}:${minute}:${second}${timeZone}?$`,
  // HH:mm:ss.sss
  regex`^${hour}:${minute}:${second}(?<millisecond>\\.[0-9]+)${timeZone}?$`,
];

export function isoTime(options: {
  message?: Message<ISOTimeErrorDetails>,
} = {}) {
  const message = options.message || formatISOTimeError;
  return (value: string) => {
    const isValid = patterns.some((pattern) => value.match(pattern));
    if (!isValid) {
      const details: ISOTimeErrorDetails = { value };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.invalidISOTime,
      });
    }
  };
}

function formatISOTimeError() {
  return 'The string must match a time in ISO format.';
}
