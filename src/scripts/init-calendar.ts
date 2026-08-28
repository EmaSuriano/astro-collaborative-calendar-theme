import Calendar from '@toast-ui/calendar';
import type { EventObject } from '@toast-ui/calendar';
import type { EventInfo } from '../types';
import { isAllDayEvent, startOfEvent } from '../utils/parseEventDate';

const CALENDAR_ID = 'community';
const DEFAULT_DURATION_MS = 90 * 60 * 1000;
const MONTH_TITLE: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
const WEEK_TITLE: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

type CalendarView = 'month' | 'week' | 'day';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toEventObject(event: EventInfo): EventObject {
  const start = startOfEvent(event);
  const allDay = isAllDayEvent(event);
  const end = allDay ? start : new Date(start.getTime() + DEFAULT_DURATION_MS);

  return {
    id: event.id,
    calendarId: CALENDAR_ID,
    title: event.eventName,
    body: event.eventLink,
    location: event.place,
    category: allDay ? 'allday' : 'time',
    isAllday: allDay,
    start,
    end,
    isReadOnly: true,
    raw: { eventLink: event.eventLink, time: event.time },
  };
}

function formatTitle(calendar: Calendar, view: CalendarView): string {
  const date = calendar.getDate().toDate();

  if (view === 'month') {
    return date.toLocaleDateString('en-GB', MONTH_TITLE);
  }

  return date.toLocaleDateString('en-GB', WEEK_TITLE);
}

function readThemeToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function isDarkTheme(): boolean {
  return document.documentElement.dataset.theme === 'dark';
}

function buildCalendarTheme() {
  const border = readThemeToken('--border', '#e7e5e4');
  const toolbar = readThemeToken('--toolbar', '#fafaf9');
  const surface = readThemeToken('--surface', '#ffffff');
  const text = readThemeToken('--text', '#1c1917');
  const muted = readThemeToken('--muted', '#57534e');
  const brand = readThemeToken('--brand', '#0f766e');
  const accent = readThemeToken('--accent', '#be185d');
  const dark = isDarkTheme();

  return {
    common: {
      backgroundColor: 'transparent',
      border: `1px solid ${border}`,
      holiday: { color: accent },
      saturday: { color: dark ? muted : '#44403c' },
      today: { color: brand },
      dayName: { color: text },
    },
    month: {
      dayName: {
        borderLeft: 'none',
        backgroundColor: dark ? toolbar : '#fafaf9',
      },
      weekend: { backgroundColor: dark ? toolbar : '#fafaf9' },
      dayExceptThisMonth: {
        color: dark ? 'rgba(168, 162, 158, 0.7)' : 'rgba(51, 51, 51, 0.4)',
      },
      moreView: {
        backgroundColor: surface,
        border: `1px solid ${border}`,
        boxShadow: dark ? '0 2px 6px 0 rgba(0, 0, 0, 0.45)' : '0 2px 6px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    week: {
      today: {
        color: brand,
        backgroundColor: dark ? 'rgba(45, 212, 191, 0.12)' : 'rgba(15, 118, 110, 0.06)',
      },
      nowIndicatorLabel: { color: brand },
      nowIndicatorBullet: { backgroundColor: brand },
      nowIndicatorToday: { border: `1px solid ${brand}` },
      nowIndicatorPast: { border: `1px dashed ${brand}` },
      dayName: {
        backgroundColor: dark ? toolbar : surface,
        borderTop: `1px solid ${border}`,
        borderBottom: `1px solid ${border}`,
      },
      weekend: { backgroundColor: dark ? toolbar : '#fafaf9' },
      futureTime: { color: text },
      pastTime: { color: muted },
      pastDay: { color: muted },
    },
  };
}

export function initEventCalendar(root: HTMLElement, events: EventInfo[]): Calendar {
  const container = root.querySelector<HTMLElement>('[data-calendar-root]');
  const titleEl = root.querySelector<HTMLElement>('[data-cal-title]');

  if (!container) {
    throw new Error('Calendar container is missing');
  }

  let view: CalendarView = 'month';

  const calendar = new Calendar(container, {
    defaultView: view,
    isReadOnly: true,
    useDetailPopup: true,
    useFormPopup: false,
    usageStatistics: false,
    gridSelection: false,
    calendars: [
      {
        id: CALENDAR_ID,
        name: 'Community events',
        backgroundColor: '#0f766e',
        borderColor: '#0d9488',
        dragBackgroundColor: '#0f766e',
        color: '#ffffff',
      },
    ],
    month: {
      startDayOfWeek: 1,
      isAlways6Weeks: true,
    },
    week: {
      startDayOfWeek: 1,
      taskView: false,
      eventView: true,
    },
    theme: buildCalendarTheme(),
    template: {
      popupDetailBody(event) {
        const raw = event.raw as { eventLink?: string } | undefined;
        const link = raw?.eventLink ?? event.body;
        if (!link) return '';
        const safe = escapeHtml(link);
        return `<a class="event-detail-link" href="${safe}" target="_blank" rel="noopener noreferrer">Open event page</a>`;
      },
      popupDetailLocation({ location }) {
        return location ? escapeHtml(location) : '';
      },
      popupDetailState() {
        return '';
      },
    },
  });

  calendar.createEvents(events.map(toEventObject));

  const applyTheme = () => {
    calendar.setTheme(buildCalendarTheme());
  };

  document.addEventListener('themechange', applyTheme);

  const syncTitle = () => {
    if (titleEl) {
      titleEl.textContent = formatTitle(calendar, view);
    }
  };

  const setView = (next: CalendarView) => {
    view = next;
    calendar.changeView(next);
    syncTitle();

    for (const button of root.querySelectorAll<HTMLButtonElement>('[data-cal-view]')) {
      button.setAttribute('aria-pressed', String(button.dataset.calView === next));
    }
  };

  root.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
      'button[data-cal-action], button[data-cal-view]',
    );
    if (!target || !root.contains(target)) return;

    if (target.dataset.calView) {
      setView(target.dataset.calView as CalendarView);
      return;
    }

    switch (target.dataset.calAction) {
      case 'prev':
        calendar.prev();
        break;
      case 'next':
        calendar.next();
        break;
      case 'today':
        calendar.today();
        break;
      default:
        return;
    }

    syncTitle();
  });

  syncTitle();
  return calendar;
}
