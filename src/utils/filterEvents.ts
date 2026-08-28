import type { EventInfo } from '../types';
import { parseEventDate } from './parseEventDate';

/**
 * Keep every past event, plus the current month and the next
 * `monthsAhead - 1` months. Far-future rows (the original sheet has
 * things like year 3333) are dropped. Toast UI can navigate backward,
 * unlike the Gatsby starter which only stacked upcoming months.
 */
export function filterEvents(
  events: EventInfo[],
  monthsAhead: number,
  now = new Date(),
): EventInfo[] {
  const endExclusive = new Date(
    now.getFullYear(),
    now.getMonth() + monthsAhead,
    1,
  );

  return events.filter((event) => {
    const date = parseEventDate(event.date);
    if (Number.isNaN(date.getTime())) {
      return false;
    }
    return date < endExclusive;
  });
}
