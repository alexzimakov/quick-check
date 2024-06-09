export function parseISODateString(dateString: string): Date | null {
  const format = /^(?<year>[0-9]{4})-(?<month>1[0-2]|0[1-9])-(?<day>3[01]|0[1-9]|[12][0-9])$/;
  const matches = dateString.match(format);
  if (matches && matches.groups) {
    const year = Number(matches.groups.year);
    const month = Number(matches.groups.month);
    const day = Number(matches.groups.day);
    if (day <= getDaysInMonth(year, month)) {
      return new Date(dateString);
    }
  }
  return null;
}

export function parseISODateTimeString(dateString: string): Date | null {
  // https://regex101.com/r/J4AWFJ/1
  const format = /^(?<year>[0-9]{4})-(?<month>1[0-2]|0[1-9])-(?<day>3[01]|0[1-9]|[12][0-9])(?:[T ](?<hour>2[0-3]|[01][0-9]):(?<minute>[0-5][0-9])(?::(?<second>[0-5][0-9])(?:\.(?<ms>[0-9]{3}))?)?(?<timeZone>Z|[+-](?:2[0-3]|[01][0-9]):?(?:[0-5][0-9]))?)?$/;
  const matches = dateString.match(format);
  if (matches && matches.groups) {
    const year = Number(matches.groups.year);
    const month = Number(matches.groups.month);
    const day = Number(matches.groups.day);
    if (day <= getDaysInMonth(year, month)) {
      return new Date(dateString.replace(' ', 'T'));
    }
  }
  return null;
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

export function isLeapYear(year: number): boolean {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

export function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if (month < 8) {
    return month % 2 === 0 ? 30 : 31;
  }
  return month % 2 === 0 ? 31 : 30;
}
