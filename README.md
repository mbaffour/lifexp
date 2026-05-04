# LifeXP

**Track your life. Level it up.**

LifeXP is a polished, frontend-only personal tracking app for habits, time, to-dos, timetables, life metrics, reports, and gamified personal analytics. It is built to feel like a clean RPG dashboard for real life while staying private, local-first, exportable, and practical.

## Features

- Landing page, app dashboard, blog/user guide, and feedback page.
- Habit tracker with XP, streaks, skips, pause/archive/delete, filters, search, and completion stats.
- Planner with gamified to-do quests, checklist steps, priority-based XP, timetable blocks, overlap warnings, and mark-done tracking.
- Time tracker with stopwatch, Pomodoro-style sessions, manual entries, tags, notes, overlap warnings, duplicate/delete, and category summaries.
- Focus Mode with custom focus and break durations.
- Life Metrics tracker for weight, sleep, mood, water, caffeine, symptoms, expenses, poop frequency, and custom metrics.
- Event-style and daily-summary metric logging.
- Calendar view for habits, time, planner items, metrics, and XP by day.
- Analytics dashboard with Recharts charts, heatmaps, weekly comparisons, and careful insight wording.
- Achievements, quests, levels, XP, coins, ranks, and adjustable gamification settings.
- Reports page with daily/weekly/monthly summaries, print/PDF support, JSON export, and CSV export.
- Data Backup / Restore with full JSON backup, CSV exports, import preview, merge/replace mode, and strong clear-data confirmation.
- Local profile name/avatar stored only in the browser.
- Light, dark, neon, forest, ocean, sunset, and minimal themes.
- GitHub Pages ready as a static browser app, with manifest and service worker support for installable/offline use after first load.
- GitHub Pages deployment workflow and issue templates.

## Screenshots

Add screenshots after deployment:

- `screenshots/landing.png`
- `screenshots/dashboard.png`
- `screenshots/metrics.png`
- `screenshots/analytics.png`

## Tech Stack

- React
- Vite
- TypeScript
- Dexie.js / IndexedDB
- Recharts
- Framer Motion
- Lucide React
- React Router
- CSS design system
- GitHub Pages

Tailwind CSS is included in dev dependencies for future utility-class expansion, but the current production UI uses a custom CSS design system to avoid native Tailwind oxide build issues seen on this Windows environment.

## Data Privacy

LifeXP has no remote backend and no real login. All data is stored locally in the browser with IndexedDB. Your habits, to-dos, timetable blocks, time entries, life metrics, body metrics, settings, reports, and local profile remain on your device unless you intentionally export them.

Important: browser storage can be cleared by the browser or device maintenance tools. Use the Backup page regularly.

## Installation

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Then open the Vite URL shown in the terminal.

## Hosted Browser Access

LifeXP is designed to be hosted from GitHub Pages at:

```text
https://YOUR_USERNAME.github.io/lifexp/
```

Once deployed, you can open that URL from any browser. The app shell is static and can be cached by the included service worker after the first visit. Your actual LifeXP data is still stored locally in each browser profile, so use Backup / Restore when moving between devices or browsers.

## Production Build

```bash
npm run build
npm run preview
```

## GitHub Pages Deployment

This project is configured for a repository named `lifexp`:

```ts
// vite.config.ts
base: "/lifexp/"
```

If your repo URL is:

```text
https://github.com/YOUR_USERNAME/lifexp
```

the deployed site will be:

```text
https://YOUR_USERNAME.github.io/lifexp/
```

Replace `YOUR_USERNAME` in:

- `package.json` homepage
- `src/pages/Landing.tsx`
- `src/pages/Feedback.tsx`
- `.github/ISSUE_TEMPLATE/config.yml`

If you rename the repo, update `vite.config.ts` to match:

```ts
base: "/YOUR_REPO_NAME/"
```

## Deploy with GitHub Actions

1. Push this project to GitHub.
2. In GitHub, go to **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main`.
5. The workflow in `.github/workflows/deploy.yml` builds `dist` and deploys it to Pages.

## Deploy with gh-pages

```bash
npm run deploy
```

This publishes the `dist` folder using the `gh-pages` package.

## Backup and Export

Use **Data Backup / Restore** inside the app to:

- Export all data as JSON.
- Import a LifeXP JSON backup.
- Choose merge or replace mode.
- Export habits, habit completions, time entries, to-dos, timetable blocks, metrics, metric logs, achievements, and reports as CSV.
- Clear all local data with strong confirmation.

The full backup includes:

- `schemaVersion`
- `exportedAt`
- `appVersion`
- `habits`
- `habitCompletions`
- `timeEntries`
- `todoItems`
- `timetableBlocks`
- `categories`
- `metricDefinitions`
- `metricLogs`
- `routines`
- `routineLogs`
- `achievements`
- `xpTransactions`
- `quests`
- `settings`
- `userProfile`
- `userStats`
- `reports`

## How to Report Bugs

Use the Feedback page or open:

```text
https://github.com/YOUR_USERNAME/lifexp/issues/new/choose
```

Include:

- What happened.
- What you expected.
- Browser/device/OS.
- Screenshots if possible.
- No private exported data unless anonymized.

## Roadmap

- More editable category and achievement management.
- Recurring timetable expansion and richer task scheduling views.
- Stronger achievement auto-unlock engine.
- Custom dashboard widget ordering.
- More report templates.
- Richer correlation explorer.
- Optional local notification reminders.
- Import from common habit/time-tracking CSV formats.
- Additional accessibility refinements and keyboard shortcuts.

## Limitations

- Data is local to the browser profile and device unless exported.
- There is no account sync because LifeXP intentionally has no backend.
- Browser storage can be cleared by the browser or user.
- Some advanced gamification and correlation features are intentionally lightweight in this first production-ready build.

## License

MIT
