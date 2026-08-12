# Architecture Data Flow

## Inputs

- User UI events (onboarding, tabs, sheets, settings)
- Browser calendar clock (local date for Today / History / Stats)
- PWA install / service worker cache (shell assets)
- Static brand assets: `favicon.svg` + home-screen PNGs under `public/icons/` (including apple-touch-icon)

## Core Processing Flow

1. `useAppStore` loads versioned document from `localStorage` (`cal_count.v1`).
2. Guard: no goals → Onboarding; else AppShell with tab content.
3. Mutations (goals, foods, entries) update React state and rewrite the storage document.
4. Nutrition derived via `domain/nutrition` (grams/ml/pieces/custom formulas).
5. Soft date sync updates `today` without full page reload.

## Outputs

- Rendered screens and sheets
- Persisted JSON in `localStorage`
- Static build artifacts under `dist/` for GitHub Pages

## Persistence

- Single document: `{ version, goals, foods, entries }`
- Defaults hydrated into `foods` on first load; entries never demo-seeded
- Orphan entries (deleted custom foods) remain editable via `foodFromEntry` reconstruction

## Failure and Recovery

- Corrupt JSON → empty document + default foods (fail soft)
- localStorage unavailable → in-memory only for the session (SSR/test guard)
- Offline after first load: SW serves shell; data stays local
