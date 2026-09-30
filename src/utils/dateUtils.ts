/** YYYY-MM-DD in the device's own timezone, so the calendar day never shifts. */
export const localDate = (d: Date): string => {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

/** Today as YYYY-MM-DD in the device's own timezone. */
export const today = (): string => localDate(new Date());

/** Parses YYYY-MM-DD into a local Date, avoiding the UTC shift of new Date(str). */
export const parseDate = (value: string): Date => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

/** Last n months as "YYYY-MM", oldest first. */
export const lastMonths = (n = 6): string[] =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (n - 1 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

/** "2026-03" -> "Mar" */
export const monthLabel = (month: string): string =>
  parseDate(`${month}-01`).toLocaleDateString(undefined, { month: 'short' });

/** "2026-03-04" -> "4 Mar 2026" */
export const dateLabel = (value: string): string =>
  parseDate(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/** ISO timestamp -> "4 Mar 2026, 14:05", for the deletion history. */
export const stampLabel = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : `${dateLabel(localDate(d))}, ${d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
};

/** Whole days between an ISO timestamp and now, for "3d ago" style labels. */
export const daysAgo = (iso: string): number => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
};
