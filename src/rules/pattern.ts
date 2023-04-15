import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';

export type PatternErrorDetails = {
  value: string;
  pattern: string,
};

export function pattern(
  pattern: RegExp,
  message: Message<PatternErrorDetails> = formatPatternError,
) {
  return (value: string) => {
    if (!value.match(pattern)) {
      const details: PatternErrorDetails = { value, pattern: String(pattern) };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.stringPattern,
      });
    }
  };
}

function formatPatternError({ pattern }: PatternErrorDetails) {
  return `The string does not match '${pattern}' pattern.`;
}
