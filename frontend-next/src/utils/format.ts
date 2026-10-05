// Display formats from WM: dates "May 1, 2016", numbers with a comma every three digits.

const numberFormat = new Intl.NumberFormat("en-US");
const dateFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
// Same look as dateFormat, but in the viewer's time zone (for server timestamps)
const localDateFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

/** 1234567 → "1,234,567" */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** 42000 → "₩42,000" (KRW has no decimals) */
export function formatPrice(value: number): string {
  return `₩${numberFormat.format(value)}`;
}

/** "2015-10-26" → "Oct 26, 2015". Parsed as UTC so the day never shifts by time zone. */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return dateFormat.format(new Date(Date.UTC(y, m - 1, d)));
}

/** ISO timestamp → "Oct 1, 2026" in the viewer's time zone (details page audit line) */
export function formatTimestampDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : localDateFormat.format(date);
}

/** Date → "YYYY-MM-DD" in local time (for sending to the API). */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" → local Date (for the calendar input). */
export function fromIsoDate(isoDate: string): Date | null {
  const [y, m, d] = isoDate.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

/** "non-fiction" → "Non-fiction" */
export function formatGenre(genre: string): string {
  return genre.charAt(0).toUpperCase() + genre.slice(1);
}
