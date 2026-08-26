export type DateString = string;

export function toISODate(date: Date): DateString {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseISODate(value: DateString): Date {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

export function isValidISODate(value: unknown): value is DateString {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function addDays(value: DateString, days: number): DateString {
  const date = parseISODate(value);

  date.setUTCDate(date.getUTCDate() + days);

  return toISODate(date);
}

export function diffInDays(from: DateString, to: DateString): number {
  const dayMilliseconds = 24 * 60 * 60 * 1000;

  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / dayMilliseconds);
}

export function today(): DateString {
  return toISODate(new Date());
}
