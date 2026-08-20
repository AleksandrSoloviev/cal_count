# Architecture Data Flow

## Inputs

- User UI events (onboarding, tabs, sheets, settings)
- Browser calendar clock (local date for Today / History / Stats)
- PWA install / service worker cache (shell assets)
- Static brand assets: `favicon.svg` + home-screen PNGs under `public/icons/` (including apple-touch-icon)

## Core Processing Flow

1. `useAppStore` loads versioned document from `localStorage` (`cal_count.v1`).
2. Guard: no goals → Onboarding wizard (`path` → know form or survey → optional Mifflin–St Jeor prefill); else AppShell with tab content.
3. Mutations (goals, foods, entries) update React state and rewrite the storage document. Survey answers are session-only and never written to storage.
4. Nutrition derived via `domain/nutrition` (grams/ml/pieces/custom formulas). Daily goal targets may be entered manually or derived via `domain/mifflin` (`calculateGoalsFromSurvey`) before Accept.
5. Today / day-detail lists group that date’s entries via `domain/meals` (consecutive-gap chaining, ≤ 30 minutes). `Meal` is derived at read time; not written to storage.
6. Library list order (Fridge via `store.foods`) is derived at read time: all-time entry count per `foodId`, then `lastUsed`, then name/`id` (`domain/foodPopularity`). No persisted usage counter.
7. Soft date sync updates `today` without full page reload.

## Outputs

- Rendered screens and sheets
- Persisted JSON in `localStorage`
- Static build artifacts under `dist/` for GitHub Pages

## Persistence

- Single document: `{ version, goals, foods, entries }`
- Defaults hydrated into `foods` on first load; entries never demo-seeded
- Orphan entries (deleted custom foods) remain editable via `foodFromEntry` reconstruction
- Library food edit (`updateFood` / `applyFoodUpdate`) mutates `foods` only; past `Entry` snapshots (`foodName`, `nutrition`) are not rewritten
- Session UI `entryFocus` / `focusSeq` (which meal accordion to expand after add/edit/delete) is never passed to `saveDocument`

## Failure and Recovery

- Corrupt JSON → empty document + default foods (fail soft)
- localStorage unavailable → in-memory only for the session (SSR/test guard)
- Offline after first load: SW serves shell; data stays local
- Edited defaults persist in the saved `foods` array; `migrate` does not re-seed over a non-empty library