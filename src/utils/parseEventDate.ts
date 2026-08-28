/**
 * Parse an event date string.
 * Accepts ISO 8601 (used by the sample data) and the original
 * Google Sheets format `MM/dd/yyyy` so a Sheets feed can drop in later.
 */
export function parseEventDate(date: string): Date {
  const sheetsFormat = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = sheetsFormat.exec(date);

  if (match) {
    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);
    return new Date(year, month - 1, day);
  }

  return new Date(date);
}
