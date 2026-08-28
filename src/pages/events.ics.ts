import type { APIRoute } from 'astro';
import { appConfig } from '../config';
import { loadEvents } from '../data/loadEvents';
import { filterEvents } from '../utils/filterEvents';
import { buildIcsCalendar } from '../utils/ics';

export const GET: APIRoute = async () => {
  const events = await loadEvents();
  const visibleEvents = filterEvents(events, appConfig.limitMonthInTheFuture);
  const body = buildIcsCalendar(visibleEvents, { title: appConfig.title });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="events.ics"',
    },
  });
};
