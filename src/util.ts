export function pluralize(
  count: number,
  singular: string,
  plural: string
): string {
  if (count === 1) {
    return count + ' ' + singular;
  }
  return count + ' ' + plural;
}

export function format(value: unknown): string {
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  if (typeof value === 'bigint') {
    return `${value}n`;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

export function formatList(
  values: unknown[] | readonly unknown[],
  params: { type: 'or' | 'and' }
): string {
  const items = values.map(format);
  const separator = ` ${params.type} `;
  return [...items.slice(0, -2), items.slice(-2).join(separator)].join(', ');
}
