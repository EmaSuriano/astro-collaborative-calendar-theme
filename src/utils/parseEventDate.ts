/**
 * Parse an event date string.
 * Accepts ISO 8601 (used by the sample data), Google Sheets
 * `M/D/YYYY` / `MM/dd/yyyy`, and datetime strings those formats often emit.
 */
export function parseEventDate(date: string): Date {
  const trimmed = date.trim();

  // US-style date from Google Forms / Sheets, with optional time.
  // Examples: 08/28/2026, 8/28/2026, 8/28/2026 18:30:00, 8/28/2026 18:30
  const sheets =
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
  const sheetsMatch = sheets.exec(trimmed);

  if (sheetsMatch) {
    const month = Number(sheetsMatch[1]);
    const day = Number(sheetsMatch[2]);
    const year = Number(sheetsMatch[3]);
    const hour = Number(sheetsMatch[4] ?? 0);
    const minute = Number(sheetsMatch[5] ?? 0);
    const second = Number(sheetsMatch[6] ?? 0);
    return new Date(year, month - 1, day, hour, minute, second);
  }

  // Sheets sometimes exports `YYYY-MM-DD HH:mm:ss` (space, not T).
  const spacedIso =
    /^(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2})(?::(\d{2}))?/;
  const spacedMatch = spacedIso.exec(trimmed);

  if (spacedMatch) {
    const year = Number(spacedMatch[1]);
    const month = Number(spacedMatch[2]);
    const day = Number(spacedMatch[3]);
    const hour = Number(spacedMatch[4]);
    const minute = Number(spacedMatch[5]);
    const second = Number(spacedMatch[6] ?? 0);
    return new Date(year, month - 1, day, hour, minute, second);
  }

  return new Date(trimmed);
}
