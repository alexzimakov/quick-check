import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';
import { regex } from '../utils/regex.js';

export type ISODatetimeErrorDetails = {
  value: string;
};

const year = /(?<year>[0-9]{4})/;
const month = /(?<month>1[0-2]|0[1-9])/;
const day = /(?<day>3[01]|0[1-9]|[12][0-9])/;
const datePatterns = [
  // YYYY
  regex`${year}`,
  // YYYY-MM
  regex`${year}-${month}`,
  // YYYY-MM-DD
  regex`${year}-${month}-${day}`,
];

const hour = /(?<hour>2[0-3]|[01][0-9])/;
const minute = /(?<minute>[0-5][0-9])/;
const second = /(?<second>[0-5][0-9])/;
const timeZone = /(?<timeZone>Z|[+-](?:2[0-3]|[01][0-9]:?([0-5][0-9])))/;
const timePatterns = [
  // HH:mm
  regex`${hour}:${minute}${timeZone}?`,
  // HH:mm:ss
  regex`${hour}:${minute}:${second}${timeZone}?`,
  // HH:mm:ss.sss
  regex`${hour}:${minute}:${second}(?<millisecond>\\.[0-9]+)${timeZone}?`,
];

const patterns: RegExp[] = [];
for (const datePattern of datePatterns) {
  for (const timePattern of timePatterns) {
    patterns.push(regex`^${datePattern}T${timePattern}$`);
  }
}

export function isoDatetime(
  message: Message<ISODatetimeErrorDetails> = formatISODatetimeError,
) {
  return (value: string) => {
    const isValid = patterns.some((pattern) => value.match(pattern));
    if (!isValid) {
      const details: ISODatetimeErrorDetails = { value };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.invalidISODatetime,
      });
    }
  };
}

function formatISODatetimeError() {
  return 'The string must match a datetime in ISO format.';
}
