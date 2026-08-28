# astro-collaborative-calendar-theme

An Astro theme for a public collaborative event calendar.

It is an Astro remake of the [Gatsby event calendar starter](https://github.com/EmaSuriano/gatsby-starter-event-calendar). The month grid is [TOAST UI Calendar](https://github.com/nhn/tui.calendar) v2. People add events through a Google Form; answers land in a Google Spreadsheet; the site reads those rows at **build time**.

## Live site

https://emasuriano.github.io/astro-collaborative-calendar-theme/

## Features

- Hero with title, subtitle, jump to the calendar, and **Add your event!** (Google Form)
- Month view by default, with week and day toggles (TOAST UI Calendar)
- Event detail popup (name, date, place, link)
- Display-only calendar; create and edit by dragging are disabled
- Theme and data-source config in `src/config.ts`
- Build-time Google Sheets CSV fetch, with sample events as fallback
- Responsive layout and basic SEO tags
- GitHub Pages deploy on push to `main`, manual dispatch, and a 6-hour schedule

## How events get onto the calendar

Same loop as the Gatsby starter, without a GCP service account:

1. Someone submits the Google Form (`formLink`).
2. Answers are stored in a Google Spreadsheet (`spreadsheetLink`).
3. `astro build` fetches the sheet as CSV and maps rows to calendar events.
4. GitHub Actions rebuilds the Pages site on push to `main` and every 6 hours, so new form answers show up after the next build.

No `googleapis` client and no service-account JSON. The sheet must be readable as CSV over HTTP (see setup below). If the fetch fails (401, network, empty sheet), the build logs a warning and falls back to the sample events in `src/data/events.ts`, so `astro build` never fails.

## Set up your own Form + Spreadsheet

The original write-up is [Building a collaborative calendar with Google and Gatsby](https://emasuriano.com/blog/building-a-collaborative-calendar-with-google-and-gatsby). The flow is the same; this theme uses **Publish to the web** instead of a service account.

1. **Create a Google Form** ([forms.new](https://forms.new)) with questions for the event name, when, where, and a link. The demo uses:
   - What is the name?
   - When?
   - Where?
   - Link to the event
2. **Send responses to a spreadsheet.** In the form, open the Responses tab and click the green Sheets icon ("View responses in Sheets"). New form answers will append as rows.
3. **Make the sheet readable at build time (both of these):**
   - Share the sheet: **Anyone with the link can view**.
   - **File → Share → Publish to the web**, choose the entire document (or the responses sheet) and CSV / web page. Until this is done, unauthenticated CSV URLs return 401 and the site shows sample events.
4. **Point the theme at your form and sheet.** In `src/config.ts` set:
   - `formLink` — the share URL of the form (`https://forms.gle/...`)
   - `spreadsheetLink` — the spreadsheet URL (`https://docs.google.com/spreadsheets/d/{id}/edit?...`)
   - `sheetColumns` — header text for `eventName`, `date`, `eventLink`, and `place` if your questions differ
   - optional `spreadsheetCsvUrl` — Publish-to-the-web link (`.../pubhtml` or `.../pub?output=csv`). The demo sheet uses this so GitHub Actions can read it without a service account.
5. **Deploy.** Push to `main` (or run the workflow manually). GitHub Actions also rebuilds on a schedule (`0 */6 * * *` UTC), so new answers appear without another git push.

The loader tries, in order:

- `spreadsheetCsvUrl` (a `/pubhtml` link is rewritten to `pub?output=csv`)
- a published `/d/e/{id}/pub?output=csv` URL derived from `spreadsheetLink` if it is a published link
- `https://docs.google.com/spreadsheets/d/{id}/export?format=csv`
- `https://docs.google.com/spreadsheets/d/{id}/gviz/tq?tqx=out:csv`

Header matching is flexible: case-insensitive, punctuation/underscores/spaces ignored. The original GraphQL slugs (`whatIsTheName____`, `when____`, `linkToTheEvent___`, `where____`) and the `EventInfo` field names also work. A Timestamp column is ignored. Rows missing a name or date are skipped.

## Project structure

    src/config.ts
    src/types.ts
    src/data/events.ts          # sample / fallback events
    src/data/loadEvents.ts      # build-time Google Sheets CSV fetch
    src/components/EventCalendar.astro
    src/components/Hero.astro
    src/pages/index.astro
    .github/workflows/deploy.yml

## Local development

Install dependencies, then run the dev, build, or preview scripts from `package.json`.

The site base is `/astro-collaborative-calendar-theme` so assets work on GitHub project pages.

## Events

Each event uses the same fields as the Gatsby starter: `id`, `eventName`, `date`, `eventLink`, `place`.

`date` can be ISO 8601, `MM/dd/yyyy`, `M/D/YYYY` (no leading zeros), or a datetime string Google Sheets often emits (`M/D/YYYY HH:mm:ss`).

## Deploy

The site is published to GitHub Pages from `main`. Config: site is `https://emasuriano.github.io` and base is `/astro-collaborative-calendar-theme`.

Rebuilds also run every 6 hours so the calendar picks up new form responses without a commit.
