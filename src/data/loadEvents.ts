import { appConfig } from '../config';
import type { EventInfo } from '../types';
import { parseEventDate } from '../utils/parseEventDate';
import { events as sampleEvents } from './events';

const SPREADSHEET_ID_RE = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
const FETCH_TIMEOUT_MS = 12_000;

type EventField = Exclude<keyof EventInfo, 'id'>;

const FIELD_ALIASES: Record<EventField, string[]> = {
  eventName: ['eventname', 'whatisthename', 'name'],
  date: ['date', 'when'],
  eventLink: ['eventlink', 'linktotheevent', 'link'],
  place: ['place', 'where'],
};

/**
 * Fetch events from the configured Google Spreadsheet CSV at build time.
 * Falls back to sample events if the sheet cannot be read so `astro build`
 * never fails (expected until the sheet is published to the web).
 */
export async function loadEvents(): Promise<EventInfo[]> {
  try {
    return await loadFromSheet();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(
      `[events] Could not load Google Sheet events: ${reason}. Falling back to sample events in src/data/events.ts. Publish the spreadsheet to the web (File → Share → Publish to the web) so live form answers appear.`,
    );
    return sampleEvents;
  }
}

async function loadFromSheet(): Promise<EventInfo[]> {
  const urls = csvUrls();

  for (const url of urls) {
    try {
      const csv = await fetchCsv(url);
      const events = rowsToEvents(parseCsv(csv));

      if (events.length === 0) {
        console.warn(
          `[events] Spreadsheet CSV was empty or had no usable rows (${url}). Falling back to sample events in src/data/events.ts.`,
        );
        return sampleEvents;
      }

      console.info(`[events] Loaded ${events.length} event(s) from ${url}`);
      return events;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(`[events] Could not load Google Sheet CSV from ${url}: ${reason}`);
    }
  }

  console.warn(
    '[events] Falling back to sample events in src/data/events.ts. Publish the spreadsheet to the web (File → Share → Publish to the web) so live form answers appear.',
  );
  return sampleEvents;
}

function csvUrls(): string[] {
  if (appConfig.spreadsheetCsvUrl) {
    return [appConfig.spreadsheetCsvUrl];
  }

  const id = spreadsheetId(appConfig.spreadsheetLink);
  if (!id) {
    throw new Error(
      `Could not derive a spreadsheet id from spreadsheetLink: ${appConfig.spreadsheetLink}`,
    );
  }

  return [
    `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`,
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`,
  ];
}

function spreadsheetId(link: string): string | undefined {
  return SPREADSHEET_ID_RE.exec(link)?.[1];
}

async function fetchCsv(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'text/csv,text/plain,*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const trimmed = text.trimStart();

    if (!trimmed || trimmed.startsWith('<') || /<!DOCTYPE/i.test(trimmed)) {
      throw new Error(
        'Got HTML instead of CSV (the sheet is probably not published to the web)',
      );
    }

    return text;
  } finally {
    clearTimeout(timer);
  }
}

function rowsToEvents(rows: string[][]): EventInfo[] {
  const headerRow = rows.find((row) => row.some((cell) => cell.trim()));
  if (!headerRow) {
    return [];
  }

  const headerIndex = rows.indexOf(headerRow);
  const columns = mapColumns(headerRow);

  if (columns.eventName === undefined || columns.date === undefined) {
    console.warn(
      '[events] Could not map spreadsheet columns for eventName/date. Check sheetColumns in src/config.ts.',
    );
    return [];
  }

  const events: EventInfo[] = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const eventName = cell(row, columns.eventName).trim();
    const date = cell(row, columns.date).trim();

    if (!eventName || !date) {
      continue;
    }

    const parsed = parseEventDate(date);
    if (Number.isNaN(parsed.getTime())) {
      console.warn(`[events] Skipping row ${i + 1}: unparseable date "${date}"`);
      continue;
    }

    events.push({
      id: `sheet-${i + 1}`,
      eventName,
      date,
      eventLink: cell(row, columns.eventLink).trim(),
      place: cell(row, columns.place).trim(),
    });
  }

  return events;
}

function mapColumns(headers: string[]): Partial<Record<EventField, number>> {
  const normalized = headers.map((header) => normalizeHeader(header));
  const columns: Partial<Record<EventField, number>> = {};

  for (const field of Object.keys(FIELD_ALIASES) as EventField[]) {
    const aliases = [
      normalizeHeader(appConfig.sheetColumns[field]),
      ...FIELD_ALIASES[field],
    ];

    const index = normalized.findIndex((header, headerIndex) => {
      if (!header || header === 'timestamp') {
        return false;
      }
      if (columns[field] !== undefined) {
        return false;
      }
      // Already claimed by another field.
      if (Object.values(columns).includes(headerIndex)) {
        return false;
      }
      return aliases.includes(header);
    });

    if (index >= 0) {
      columns[field] = index;
    }
  }

  return columns;
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cell(row: string[], index: number | undefined): string {
  if (index === undefined) {
    return '';
  }
  return row[index] ?? '';
}

/**
 * RFC 4180-ish CSV parser. Handles quoted fields, escaped quotes, and
 * newlines inside quotes. No extra dependency required.
 */
export function parseCsv(text: string): string[][] {
  const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];

    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char === '\r') {
      // Swallow CR; LF (or end of file) closes the row.
    } else {
      field += char;
    }
  }

  if (inQuotes) {
    // Unterminated quote — still emit what we have so mapping can warn.
    row.push(field);
    rows.push(row);
    return rows;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((entry) => entry.some((value) => value.trim()));
}
