# Project Context

## Purpose

- **Cal Count** is a mobile-first Progressive Web App for logging daily calories and macros (protein, fat, carbs) against personal goals.

## Primary Users

- Individuals tracking their own nutrition on a phone browser / installed PWA (single-device, local-only MVP).

## Current Scope

- Onboarding + Settings for goals; Today log; Fridge food library; History; Stats; PWA install on GitHub Pages `/cal_count/`.
- Spec Kit durable memory under `.specify/memory/`; work item `specs/001-calorie-pwa/`.

## Non-Goals

- Backend, accounts, cloud sync, multi-device restore (post-MVP).
- Second locale / in-app language switch (strings are localization-ready).
- Barcode scanning or third-party nutrition databases.

## Open Questions

- Exact IndexedDB migration timing when data volume grows (localStorage sufficient for MVP).
