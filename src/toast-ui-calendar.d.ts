declare module '@toast-ui/calendar' {
  export type EventObject = {
    id?: string;
    calendarId?: string;
    title?: string;
    body?: string;
    location?: string;
    category?: string;
    isAllday?: boolean;
    isReadOnly?: boolean;
    start?: Date | string;
    end?: Date | string;
    raw?: unknown;
  };

  export default class Calendar {
    constructor(container: HTMLElement, options?: Record<string, unknown>);
    createEvents(events: EventObject[]): void;
    changeView(view: string): void;
    prev(): void;
    next(): void;
    today(): void;
    getDate(): { toDate(): Date };
    setTheme(theme: Record<string, unknown>): void;
  }
}
