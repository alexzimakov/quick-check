export function freezeMap<K, V>(map: Map<K, V>): Map<K, V> {
  return new Proxy(map, {
    get(target, name) {
      if (name === 'set') {
        return (key: K) => {
          throw new TypeError(`Cannot set key ${String(key)}, map is immutable.`);
        };
      }

      if (name === 'delete') {
        return (key: K) => {
          throw new TypeError(`Cannot delete key '${String(key)}', map is immutable.`);
        };
      }

      if (name === 'clear') {
        return () => {
          throw new TypeError('Cannot clear immutable map.');
        };
      }

      const property = Reflect.get(target, name);
      return typeof property === 'function'
        ? property.bind(target)
        : property;
    },
  });
}

export function formatList(list: unknown[], options: {
  type?: 'conjunction' | 'disjunction' | 'unit';
  quoteStyle?: string;
  quoteValues?: boolean;
} = {}): string {
  let values: string[];
  if (options.quoteValues) {
    const quote = options.quoteStyle || '"';
    values = list.map((item) => quote + String(item) + quote);
  } else {
    values = list.map((item) => String(item));
  }

  const type = options.type || 'unit';
  if (type === 'unit') {
    return values.join(', ');
  }

  let separator: string;
  if (type === 'conjunction') {
    separator = 'and';
  } else {
    separator = 'or';
  }

  if (list.length <= 2) {
    return values.join(` ${separator} `);
  }

  const lastIndex = values.length - 1;
  const lastItem = values[lastIndex];
  values[lastIndex] = `${separator} ${lastItem}`;
  return values.join(', ');
}

export function pluralize(count: number, options: {
  singular: string;
  plural: string;
}) {
  return `${count} ${count > 1 ? options.plural : options.singular}`;
}
