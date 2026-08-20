# Screen Registry (durable UI memory)

| SCREEN-ID | Screen name | Route | Archetype | Controller | Touched (work-items) |
|-----------|-------------|-------|-----------|------------|----------------------|
| SCREEN-app-shell | AppShell | in-memory shell (`tab` + modals); PWA base `/cal_count/` | shell | `App` + `useAppStore` | 001-calorie-pwa |
| SCREEN-onboarding | Onboarding | full-screen when `goals == null`; multi-step form (`path` → `know` \| `sex`→`body`→`goal`→`review`) | form | `OnboardingScreen` | 001-calorie-pwa, 004-mifflin-jeor |
| SCREEN-today | Today | tab `home` | composite | `TodayScreen` | 001-calorie-pwa, 005-meal-grouping |
| SCREEN-fridge | Fridge | tab `fridge` | collection | `FridgeScreen` | 001-calorie-pwa, 003-edit-fridge-food |
| SCREEN-history | History | tab `history` | collection | `HistoryScreen` | 001-calorie-pwa |
| SCREEN-stats | Stats | tab `stats` | composite | `StatsScreen` | 001-calorie-pwa |
| SCREEN-settings | Settings | overlay `settingsOpen` | form | `SettingsScreen` | 001-calorie-pwa |
| SCREEN-log-food | LogFoodSheet | modal `log-food` | form | `LogFoodSheet` | 001-calorie-pwa |
| SCREEN-add-food | AddFoodSheet | modal `add-food` \| `edit-food` (same sheet, add\|edit mode) | form | `AddFoodSheet` | 001-calorie-pwa, 003-edit-fridge-food |
| SCREEN-day-detail | DayDetailSheet | modal `day-detail` | detail | `DayDetailSheet` | 001-calorie-pwa, 005-meal-grouping |
