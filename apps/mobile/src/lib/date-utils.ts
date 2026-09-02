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

/**
 * Week dates shown on the meal plan. The current week is clipped to today
 * and later so past days drop off; other weeks stay Monday–Sunday.
 */
export function getVisibleWeekDates(reference = new Date(), today = new Date()): Date[] {
  const dates = getCurrentWeekDates(reference);
  const todayISO = toISODate(today);
  if (!dates.some((date) => toISODate(date) === todayISO)) return dates;
  return dates.filter((date) => toISODate(date) >= todayISO);
}

/** Parses a "YYYY-MM-DD" string as local midnight (avoids `new Date(str)`'s UTC-parsing gotcha). */
export function fromISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isSameDate(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

const BCP47_TAG: Record<string, string> = { en: 'en-US', de: 'de-DE' };

function bcp47(locale: string): string {
  return BCP47_TAG[locale] ?? 'en-US';
}

export function weekdayShort(date: Date, locale = 'en'): string {
  return date.toLocaleDateString(bcp47(locale), { weekday: 'short' });
}

export function dayOfMonth(date: Date): string {
  return String(date.getDate());
}

/** e.g. "Jul 21–27" or "Jul 29 – Aug 4" if the range crosses a month boundary. */
export function formatWeekRange(dates: Date[], locale = 'en'): string {
  const start = dates[0];
  const end = dates[dates.length - 1];
  if (!start || !end) return '';
  const startMonth = start.toLocaleDateString(bcp47(locale), { month: 'short' });
  if (toISODate(start) === toISODate(end)) {
    return `${startMonth} ${dayOfMonth(start)}`;
  }
  const endMonth = end.toLocaleDateString(bcp47(locale), { month: 'short' });

  if (startMonth === endMonth) {
    return `${startMonth} ${dayOfMonth(start)}–${dayOfMonth(end)}`;
  }
  return `${startMonth} ${dayOfMonth(start)} – ${endMonth} ${dayOfMonth(end)}`;
}
