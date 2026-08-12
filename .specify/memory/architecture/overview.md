# Architecture Overview

## System Shape

- Single-page Progressive Web App (static SPA) served from GitHub Pages under `/cal_count/`.

## Major Components

- `src/domain/` — types, nutrition math, validation, defaults, dates, `foodFromEntry`
- `src/storage/` — versioned localStorage document
- `src/state/useAppStore.ts` — React app state + persistence
- `src/screens/` + `src/components/` — UI (Today, Fridge, History, Stats, Settings, sheets)
- `src/i18n/en.ts` — centralized English strings
- `.specify/` — Spec Kit memory, templates, scripts
- `specs/` — work-item feature artifacts (e.g. `001-calorie-pwa`, `002-ios-pwa-home`)

## Runtime Boundaries

- All product data stays in the browser; no remote API in MVP.
- Service worker caches the app shell for offline reopen after first load.

## External Integrations

- None (fonts loaded from Google Fonts CDN at runtime when online).

## Key Constraints

- `vite` `base` and PWA `scope`/`start_url` must remain `/cal_count/`.
- Home-screen / install icons: opaque PNGs in `public/icons/` (`icon-180.png`, `icon-192.png`, `icon-512.png`) derived from `public/favicon.svg`; `index.html` must include `rel="apple-touch-icon"` (iOS does not reliably use manifest icons). Avoid transparent icon backgrounds (iOS fills them black).
- No seeded demo history in production builds.
- Roadmap: validate web PWA first; then port to React Native (see ADR `2026-08-12-web-mvp-then-react-native.md`).
