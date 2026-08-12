# UI Conventions (durable UI memory)

## State-modeling conventions

- App navigation is in-memory (`tab`, `modal`, `settingsOpen`) — no path router for MVP.
- Forms (onboarding, settings, log/add/edit sheets): local draft state + field errors; persist only on successful confirm.
- Onboarding is a multi-step form wizard (`path` | `know` | `sex` | `body` | `goal` | `review`) with ephemeral survey answers; only accepted `Goals` are written via `setGoals`.
- Collections (Fridge, History, Today log): empty vs data derived from array length; no remote loading state.
- Composite screens (Today, Stats): progress/summary always present when goals exist; secondary region empty/data independently.
- Soft date rollover: `today` synced on midnight timer, `visibilitychange`, and `window focus`.

## Reusable components / patterns

- `NutrientBar` — progress vs goal with overflow styling
- `BottomNav` — four primary tabs
- `GoalInput` — shared onboarding/settings numeric field (know path + calculated review)
- `EntryRow` / `FoodRow` — list rows with overflow menu (FoodRow: Edit / Duplicate / Delete-custom)
- `NutritionFields` — 2×2 nutrient inputs for custom foods
- Bottom sheets: `LogFoodSheet`, `AddFoodSheet` (add \| edit mode via modal `add-food` / `edit-food`), `DayDetailSheet`

## Design-token / theme conventions

- CSS variables in `src/styles/theme.css`: `--background`, `--foreground`, `--card`, `--border`, `--muted`, `--muted-foreground`, `--primary`, `--primary-foreground`, `--destructive`
- Nutrient colors (also hex in `NUTRIENT_META` for charts): calories `#16a34a`, protein `#2563eb`, fat `#d97706`, carbs `#7c3aed`, overflow `#ef4444`
- Typography: DM Sans (UI), DM Mono (numeric)
- Mobile column: `max-w-md mx-auto` (onboarding column often `max-w-sm`); bottom nav + `safe-area` padding
- User-facing copy via `src/i18n/en.ts` only (localization-ready)
