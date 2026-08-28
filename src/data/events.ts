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
const samples: Omit<EventInfo, 'id' | 'date'>[] = [
  {
    eventName: 'JS Berlin Meetup',
    place: 'c-base, Berlin',
    eventLink: 'https://www.meetup.com/',
  },
  {
    eventName: 'Design Systems Circle',
    place: 'Betahaus, Berlin',
    eventLink: 'https://www.meetup.com/',
  },
  {
    eventName: 'Open Source Friday',
    place: 'Factory Berlin',
    eventLink: 'https://www.meetup.com/',
  },
  {
    eventName: 'Python User Group',
    place: 'Mozilla Berlin',
    eventLink: 'https://www.meetup.com/',
  },
  {
    eventName: 'Women Who Code',
    place: 'SAP Office, Berlin',
    eventLink: 'https://www.meetup.com/',
  },
  {
    eventName: 'Rust Berlin',
    place: 'Thoughtworks, Berlin',
    eventLink: 'https://www.meetup.com/',
  },
  {
    eventName: 'Accessibility Working Group',
    place: 'Online',
    eventLink: 'https://www.meetup.com/',
  },
  {
    eventName: 'GraphQL Meetup',
    place: 'Delivery Hero, Berlin',
    eventLink: 'https://www.meetup.com/',
  },
  {
    eventName: 'Hack Night',
    place: 'Impact Hub, Berlin',
    eventLink: 'https://www.meetup.com/',
  },
  {
    eventName: 'Astro Community Call',
    place: 'Online',
    eventLink: 'https://astro.build/chat',
  },
  {
    eventName: 'CSS Berlin',
    place: 'Spektral, Berlin',
    eventLink: 'https://www.meetup.com/',
  },
  {
    eventName: 'DevOps & Cloud Meetup',
    place: 'AWS Loft, Berlin',
    eventLink: 'https://www.meetup.com/',
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
