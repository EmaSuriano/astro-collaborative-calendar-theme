import type { EventInfo } from '../types';

/**
 * Static sample events for the theme demo and for build-time fallback
 * when the Google Spreadsheet CSV cannot be read (unpublished sheet,
 * 401, network error, or empty rows). `loadEvents()` in loadEvents.ts
 * prefers live form answers and only uses this list as a fallback.
 *
 * Dates are computed from "today" at build time so the calendar always
 * looks populated across this month and the next one or two.
 */
const samples: Omit<EventInfo, 'id' | 'date'>[
  {
    eventName: 'Harbor JS Meetup',
    place: 'Harbor Hall',
    eventLink: 'https://example.com',
  },
  {
    eventName: 'Design Circle',
    place: 'Riverside Studio',
    eventLink: 'https://example.com',
  },
  {
    eventName: 'Open Source Friday',
    place: 'Community Lab',
    eventLink: 'https://example.com',
  },
  {
    eventName: 'Python User Group',
    place: 'Northside Library',
    eventLink: 'https://example.com',
  },
  {
    eventName: 'Access Working Group',
    place: 'Online',
    eventLink: 'https://example.com',
  },
  {
    eventName: 'Rust Meetup',
    place: 'Maker Space',
    eventLink: 'https://example.com',
  },
  {
    eventName: 'GraphQL Meetup',
    place: 'Tech Hub',
    eventLink: 'https://example.com',
  },
  {
    eventName: 'Hack Night',
    place: 'Civic Workshop',
    eventLink: 'https://example.com',
  },
  {
    eventName: 'Frontend Community Call',
    place: 'Online',
    eventLink: 'https://example.com',
  },
  {
    eventName: 'CSS Meetup',
    place: 'Studio Four',
    eventLink: 'https://example.com',
  },
  {
    eventName: 'Cloud Meetup',
    place: 'Example Loft',
    eventLink: 'https://example.com',
  },
  {
    eventName: 'Product Book Club',
    place: 'Online',
    eventLink: 'https://example.com',
  },
];

/** Day offsets from today, plus a local start time. */
const schedule: { offset: number; hour: number; minute: number }[] = [
  { offset: -16, hour: 19, minute: 0 },
  { offset: -9, hour: 18, minute: 30 },
  { offset: -3, hour: 17, minute: 0 },
  { offset: 0, hour: 18, minute: 30 },
  { offset: 5, hour: 19, minute: 0 },
  { offset: 12, hour: 18, minute: 30 },
  { offset: 19, hour: 18, minute: 0 },
  { offset: 26, hour: 19, minute: 0 },
  { offset: 33, hour: 18, minute: 0 },
  { offset: 40, hour: 18, minute: 30 },
  { offset: 47, hour: 19, minute: 0 },
  { offset: 54, hour: 18, minute: 30 },
];

function toLocalIso(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function dateFromOffset(offset: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, minute, 0, 0);
  return toLocalIso(date);
}

export const events: EventInfo[] = samples.map((sample, index) => {
  const slot = schedule[index] ?? { offset: 7 * (index + 1), hour: 18, minute: 30 };

  return {
    id: String(index + 1),
    date: dateFromOffset(slot.offset, slot.hour, slot.minute),
    ...sample,
  };
});
