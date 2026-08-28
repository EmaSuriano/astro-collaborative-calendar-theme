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
  // Plug these in later when Google Forms / Sheets are wired up:
  // formLink: 'https://forms.gle/...',
  // spreadsheetLink: 'https://docs.google.com/spreadsheets/d/...',
} as const;
