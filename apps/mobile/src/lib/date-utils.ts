/** Monday–Sunday dates for the week containing `reference` (local time). */
export function getCurrentWeekDates(reference = new Date()): Date[] {
  const start = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const weekday = start.getDay(); // 0 = Sunday
  const daysSinceMonday = (weekday + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    return date;
  });
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDate(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

export function weekdayShort(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function dayOfMonth(date: Date): string {
  return String(date.getDate());
}

/** e.g. "Jul 21–27" or "Jul 29 – Aug 4" if the range crosses a month boundary. */
export function formatWeekRange(dates: Date[]): string {
  const start = dates[0];
  const end = dates[dates.length - 1];
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });

  if (startMonth === endMonth) {
    return `${startMonth} ${dayOfMonth(start)}–${dayOfMonth(end)}`;
  }
  return `${startMonth} ${dayOfMonth(start)} – ${endMonth} ${dayOfMonth(end)}`;
}
