# Development Code Style

## Formatting

- TypeScript + React function components; Tailwind utility classes in JSX
- Prefer named `const` handlers with `handle` prefix where event-specific

## Naming and Structure

- `src/domain/` — pure types and logic (no React)
- `src/storage/` — persistence only
- `src/state/` — app store hook
- `src/screens/` — route-level screens
- `src/components/` — shared UI; sheets under `components/sheets/`
- `src/i18n/en.ts` — all user-facing English strings
- Tests under `tests/*.test.ts` (Vitest + jsdom)

## Testing Expectations

- Domain math (nutrition, Mifflin–St Jeor / `calculateGoalsFromSurvey`), validation (including `validateSurveyBody`), dates, storage migrate/load, `foodFromEntry`, `applyFoodUpdate` / food-edit persist path, meal grouping (`groupEntriesIntoMeals`, `resolveExpandedMealIndex`), and fridge popularity sort (`countFoodUsage`, `sortFoodsByPopularity`) covered by Vitest
- UI acceptance via manual mobile / Pages checklist (`quickstart.md`)
- TDD not mandated by constitution; add unit tests when fixing domain bugs

## Review Checklist

- Keep durable memory aligned via `/speckit.finalize`
- Do not invent modules outside plan/spec
- Preserve `/cal_count/` base for assets, SW, and Pages
- No seeded history in production data paths

## Exceptions

- Chart colors use hex constants (SVG) mirrored from theme nutrient tokens
