import type { EventInfo } from '../types';
import { parseEventDate } from './parseEventDate';

/**
 * Keep events in the current month and the next `monthsAhead - 1` months.
 * Past months are dropped; days that already passed in the current month stay.
 */
export function filterEvents(
  events: EventInfo[],
  monthsAhead: number,
  now = new Date(),
): EventInfo[] {
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endExclusive = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1);

  return events.filter((event) => {
    const date = parseEventDate(event.date);
    return date >= startOfCurrentMonth && date < endExclusive;
  });
}
