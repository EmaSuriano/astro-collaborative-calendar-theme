export const appConfig = {
  title: 'Collaborative Event Calendar',
  subTitle: 'The easiest way to share community events',
  description:
    'A public event calendar for meetups and organizers. Browse what is happening this month, open an event for details, and share the page with your community.',
  /**
   * How many months ahead to show, including the current month.
   * Matches the original Gatsby starter's `limitMonthInTheFuture`.
   */
  limitMonthInTheFuture: 4,
  githubUrl: 'https://github.com/EmaSuriano/astro-collaborative-calendar-theme',
  author: {
    name: 'Ema Suriano',
    url: 'https://emasuriano.com',
  },
  /** Google Form that writes new events into the spreadsheet. */
  formLink: 'https://forms.gle/5Kv3XKJBA5g5FWRC7',
  /** Spreadsheet that stores form answers. Used as a human-facing link. */
  spreadsheetLink:
    'https://docs.google.com/spreadsheets/d/1e6mNWZZLuBBFk2c-zGRSSh8g5mqoQUPbW78NmA_EI88/edit?usp=sharing',
  /**
   * Optional explicit CSV endpoint. When omitted, the build-time loader
   * derives export / gviz URLs from `spreadsheetLink`.
   */
  spreadsheetCsvUrl: undefined as string | undefined,
  /**
   * Spreadsheet column headers for each EventInfo field.
   * Defaults match the original Gatsby form questions. Matching is
   * case-insensitive and ignores punctuation, spaces, and underscores,
   * so GraphQL-style slugs like `whatIsTheName____` also work.
   */
  sheetColumns: {
    eventName: 'What is the name?',
    date: 'When?',
    eventLink: 'Link to the event',
    place: 'Where?',
  },
};
