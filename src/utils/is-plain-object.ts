export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  if (proto === null) {
    return true;
  }

  let parentProto = proto;
  while (Object.getPrototypeOf(parentProto) !== null) {
    parentProto = Object.getPrototypeOf(parentProto);
  }
  return parentProto === proto;
}
