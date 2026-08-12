# ADR: Web MVP first, then React Native

**Date**: 2026-08-12  
**Status**: Accepted  
**Work item context**: `001-calorie-pwa` and follow-on product plan

## Context

Cal Count is being validated as a Progressive Web App (GitHub Pages, localStorage, installable). After dogfooding that web version, the product should move to a cross-platform mobile client.

## Decision

1. Keep the **current phase** as a **web PWA** for real-world validation.
2. After web dogfooding, **port functionality to React Native** (cross-platform iOS/Android).
3. Prefer extracting or mirroring **domain logic** (types, nutrition formulas, validation, default foods) so RN does not reinvent product rules.
4. Do **not** start RN or a backend until the web MVP has been exercised enough to confirm scope.

## Consequences

- Near-term work stays in the Vite/React web app.
- A future work item / branch will introduce a React Native app (Expo or bare — TBD).
- Persistence on RN will likely differ (e.g. AsyncStorage / SQLite) while product entities stay aligned with the web data model.
- Spec Kit memory (`context.md`, this ADR) is the source of truth for this sequencing.
