export function regex(strings: TemplateStringsArray, ...regExps: RegExp[]) {
  let pattern = '';
  let flags = '';
  for (let i = 0; i < strings.length; i++) {
    const string = strings[i];
    pattern += string;

    if (i < regExps.length) {
      const regExp = regExps[i];
      pattern += regExp.source;

      const regExpFlags = regExp.flags.split('');
      for (let j = 0; j < regExpFlags.length; j += 1) {
        const flag = regExpFlags[j];
        if (!flags.includes(flag)) {
          flags += flag;
        }
      }
    }
  }
  return new RegExp(pattern, flags);
}
