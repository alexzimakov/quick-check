import util from 'node:util';

export function format(value: unknown): string {
  return util.format(typeof value === 'bigint' ? '%s' : '%j', value);
}
