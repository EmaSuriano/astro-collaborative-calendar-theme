# astro-collaborative-calendar-theme

An Astro theme for a public collaborative event calendar.

It is an Astro remake of the Gatsby event calendar starter. The month grid is TOAST UI Calendar v2.

## Live site

https://emasuriano.github.io/astro-collaborative-calendar-theme/

## Features

- Hero with title, subtitle, and a jump to the calendar
- Month view by default, with week and day toggles
- Event detail popup (name, date, place, link)
- Display-only calendar; create and edit by dragging are disabled
- Theme config in src/config.ts
- Static sample events in src/data/events.ts
- Responsive layout and basic SEO tags
- GitHub Pages site and base already set for this repo

Google Spreadsheets and Google Forms are not wired up in this first version. Replace the sample events module later, or point formLink in config at a form.

## Project structure

    src/config.ts
    src/types.ts
    src/data/events.ts
    src/components/EventCalendar.astro
    src/components/Hero.astro
    src/pages/index.astro

## Local development

Install dependencies, then run the dev, build, or preview scripts from package.json.

The site base is /astro-collaborative-calendar-theme so assets work on GitHub project pages.

## Events

Each event uses the same fields as the Gatsby starter: id, eventName, date, eventLink, place.

date can be ISO 8601, or MM/dd/yyyy from the original spreadsheet feed.

Sample events are generated from the build date so the demo stays filled for the current month and the next couple of months. Edit src/data/events.ts to use your own list.

## Deploy

The site is published to GitHub Pages from main. Config: site is https://emasuriano.github.io and base is /astro-collaborative-calendar-theme.
