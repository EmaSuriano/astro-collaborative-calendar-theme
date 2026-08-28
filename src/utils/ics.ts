import type { EventInfo } from '../types';
import { isAllDayEvent, startOfEvent } from './parseEventDate';

/** Same default length as `src/scripts/init-calendar.ts`. */
const DEFAULT_DURATION_MS = 90 * 60 * 1000;
const PRODID = '-//Ema Suriano//Collaborative Event Calendar//EN';
const UID_HOST = 'emasuriano.github.io';
const CRLF = '\r\n';

export function buildIcsCalendar(
  events: EventInfo[],
  options: { title: string; now?: Date },
): string {
  const stamp = formatUtcDateTime(options.now ?? new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(options.title)}`,
  ];

  for (const event of events) {
    lines.push(...veventLines(event, stamp));
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join(CRLF) + CRLF;
}

function veventLines(event: EventInfo, stamp: string): string[] {
  const start = startOfEvent(event);
  const allDay = isAllDayEvent(event);
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${event.id}@${UID_HOST}`,
    `DTSTAMP:${stamp}`,
  ];

  if (allDay) {
    const end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + 1,
    );
    lines.push(`DTSTART;VALUE=DATE:${formatDate(start)}`);
    lines.push(`DTEND;VALUE=DATE:${formatDate(end)}`);
  } else {
    const end = new Date(start.getTime() + DEFAULT_DURATION_MS);
    lines.push(`DTSTART:${formatDateTime(start)}`);
    lines.push(`DTEND:${formatDateTime(end)}`);
  }

  lines.push(`SUMMARY:${escapeText(event.eventName)}`);

  if (event.place) {
    lines.push(`LOCATION:${escapeText(event.place)}`);
  }

  if (event.eventLink) {
    lines.push(`DESCRIPTION:${escapeText(event.eventLink)}`);
    lines.push(`URL:${event.eventLink}`);
  }

  lines.push('END:VEVENT');
  return lines;
}

/** RFC 5545 TEXT: escape `\`, `;`, `,` and newlines. */
function escapeText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replaceAll('\n', '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,');
}

/** Fold logical lines at 75 octets (RFC 5545 §3.1). */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(line);
  if (bytes.length <= 75) {
    return line;
  }

  const decoder = new TextDecoder();
  const parts: string[] = [];
  let offset = 0;
  let max = 75;

  while (offset < bytes.length) {
    let end = Math.min(offset + max, bytes.length);
    while (end > offset && end < bytes.length && (bytes[end]! & 0xc0) === 0x80) {
      end -= 1;
    }
    parts.push(decoder.decode(bytes.subarray(offset, end)));
    offset = end;
    max = 74;
  }

  return parts.join(`${CRLF} `);
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

/** Floating local DATETIME. Do not append Z. */
function formatDateTime(date: Date): string {
  return `${formatDate(date)}T${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;
}

function formatUtcDateTime(date: Date): string {
  return `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`;
}
