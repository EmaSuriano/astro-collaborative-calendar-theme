export type EventInfo = {
  id: string;
  eventName: string;
  date: string;
  eventLink: string;
  place: string;
  /** Optional start time from the form (`10:10:00 AM`). Empty means all-day. */
  time?: string;
};
