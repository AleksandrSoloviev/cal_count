# Project Context

## Purpose

- **Cal Count** is a mobile-first Progressive Web App for logging daily calories and macros (protein, fat, carbs) against personal goals.

## Primary Users

- Individuals tracking their own nutrition on a phone browser / installed PWA (single-device, local-only MVP).

## Current Scope

- Onboarding (know C/P/F/C or Mifflin–St Jeor survey → editable goals) + Settings for goals; Today log; Fridge food library; History; Stats; PWA install on GitHub Pages `/cal_count/`.
- Spec Kit durable memory under `.specify/memory/`; feature work under `specs/` (e.g. `004-mifflin-jeor`).
- MVP is **web-only** (browser / PWA) for dogfooding before any native client.

## Roadmap (repo-level plan)

1. **Now — Web MVP dogfood**: Use the GitHub Pages PWA; validate flows, persistence, and install-to-home-screen in real use.
2. **After web validation — React Native**: Port the same product functionality to a cross-platform client (**React Native**) for iOS/Android, reusing domain concepts (goals, foods, entries, nutrition math) where practical.
3. **Later (optional)**: Backend / sync only after the RN phase is planned; not required for the web MVP.

See ADR: `.specify/memory/architecture/adr/2026-08-12-web-mvp-then-react-native.md`.

## Non-Goals

- Backend, accounts, cloud sync, multi-device restore (during web MVP).
- Shipping React Native in the current web MVP phase.
- Second locale / in-app language switch (strings are localization-ready).
- Barcode scanning or third-party nutrition databases.
- Persisting body-profile survey answers or embedding the Mifflin calculator in Settings (first-run onboarding only).

## Open Questions

- Exact IndexedDB migration timing when data volume grows (localStorage sufficient for MVP).
- RN stack details (Expo vs bare, navigation, storage) — decide when starting the native phase.
- Whether web PWA remains supported alongside RN or is replaced.
