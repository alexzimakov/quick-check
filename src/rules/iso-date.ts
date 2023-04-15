import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';
import { regex } from '../utils/regex.js';

export type ISODateErrorDetails = {
  value: string;
};

const year = /(?<year>[0-9]{4})/;
const month = /(?<month>1[0-2]|0[1-9])/;
const day = /(?<day>3[01]|0[1-9]|[12][0-9])/;
const patterns = [
  // YYYY
  regex`^${year}$`,
  // YYYY-MM
  regex`^${year}-${month}$`,
  // YYYY-MM-DD
  regex`^${year}-${month}-${day}$`,
];
export function isoDate(
  message: Message<ISODateErrorDetails> = formatISODateError,
) {
  return (value: string) => {
    const isValid = patterns.some((pattern) => value.match(pattern));
    if (!isValid) {
      const details: ISODateErrorDetails = { value };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.invalidISODate,
      });
    }
  };
}

function formatISODateError() {
  return 'The string must match a date in ISO format.';
}
