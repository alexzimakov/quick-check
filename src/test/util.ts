import util from 'node:util';

export function format(value: unknown): string {
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  if (typeof value === 'bigint') {
    return `${value}n`;
  }
  if (Number.isNaN(value)) {
    return 'NaN';
  }
  return util.format('%j', value);
}
