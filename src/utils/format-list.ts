export type FormatListOptions = {
  type?: 'and' | 'or',
  maxItems?: number;
  quoteItems?: boolean;
  quoteStyle?: string;
};

export function formatList(
  items: unknown[] | readonly unknown[],
  params: FormatListOptions = {},
): string {
  let type = params.type;
  if (type === undefined) {
    type = 'and';
  } else if (type !== 'and' && type !== 'or') {
    throw new Error("Parameter `type` must be 'and' or 'or'.");
  }

  let maxItems = params.maxItems;
  if (maxItems === undefined) {
    maxItems = items.length;
  } else if (maxItems < 1) {
    throw new Error('Parameter `maxItems` must be positive integer.');
  }

  const quote = params.quoteStyle || "'";
  const strings = items.map(params.quoteItems
    ? (item) => (quote + String(item) + quote)
    : (item) => String(item));

  if (strings.length <= 2) {
    return strings.join(` ${type} `);
  }

  if (strings.length > maxItems + 1) {
    strings.splice(maxItems);
    strings.push(`${items.length - maxItems} more`);
  }

  if (strings.length <= 2) {
    return strings.join(` ${type} `);
  }

  const lastIndex = strings.length - 1;
  const lastElement = strings[lastIndex];
  strings[lastIndex] = `${type} ${lastElement}`;
  return strings.join(', ');
}
