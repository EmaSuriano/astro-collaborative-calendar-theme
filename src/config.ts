export const appConfig = {
  title: 'Collaborative Event Calendar',
  subTitle: 'The easiest way to share community events',
  description:
    'A public event calendar for meetups and organizers. Browse what is happening this month, open an event for details, and share the page with your community.',
  /**
   * How many months ahead to include, counting the current month.
   * Past events are kept so the Toast UI calendar can go backward.
   */
  limitMonthInTheFuture: 4,
  githubUrl: 'https://github.com/EmaSuriano/astro-collaborative-calendar-theme',
  author: {
    name: 'Alex Rivera',
    url: 'https://example.com',
  },
  /** Google Form that writes new events into the spreadsheet. */
  formLink: 'https://forms.gle/5Kv3XKJBA5g5FWRC7',
  /** Spreadsheet that stores form answers. Used as a human-facing link. */
  spreadsheetLink:
    'https://docs.google.com/spreadsheets/d/1e6mNWZZLuBBFk2c-zGRSSh8g5mqoQUPbW78NmA_EI88/edit?usp=sharing',
  /**
   * Published-to-the-web URL (html or csv). The loader turns `/pubhtml`
   * into `pub?output=csv` so GitHub Actions can fetch rows without auth.
   */
  spreadsheetCsvUrl:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQruXhA2vDFmp22O7KcqzvGdNw2dBQIRZjD0C8JlcGn5_hp3wOIX6dHUfAW0kLNhyUuqXDiRLPzA-dW/pubhtml',
  /**
   * Spreadsheet column headers for each EventInfo field.
   * Defaults match the original Gatsby form questions. Matching is
   * case-insensitive and ignores punctuation, spaces, underscores, and emoji,
   * so GraphQL-style slugs like `whatIsTheName____` also work.
   */
  sheetColumns: {
    eventName: 'What is the name?',
    date: 'When?',
    eventLink: 'Link to the event',
    place: 'Where?',
    time: 'Time',
  },
};
