# cal_count Constitution

## Core Principles

### I. Spec-Driven Delivery
Work starts from Spec Kit artifacts (`/speckit.start` and related commands). Durable facts live in `.specify/memory/`; feature work lives under `specs/`. Do not invent undocumented modules or behaviors.

### II. Repository as Source of Truth
Document only facts discoverable from the repo or explicitly decided by the team. Unknowns use `TODO:` markers. Prefer updating memory over relying on chat history.

### III. Simplicity First
Prefer the smallest design that satisfies the current work item. No speculative abstractions, services, or infrastructure until a real need appears in a plan or ADR.

### IV. Explicit Decisions
Significant stack, architecture, and product-boundary choices are recorded as ADRs under `.specify/memory/architecture/adr/`. Prefer amending memory over silent drift.

### V. Quality Gates Before Done
Implementation is not complete until the work item’s acceptance checks pass and `/speckit.finalize` (when used) syncs durable docs. Do not leave placeholder or template text in owned artifacts.

## Product Constraints

- Domain: personal calorie/macro tracking PWA (Cal Count).
- Platform: mobile-first web / installable PWA; GitHub Pages project site `/cal_count/`.
- Privacy: browser-local data only for MVP (no backend, no cloud sync).

## Development Workflow

1. Adopt / refresh memory when the repo shape changes materially (`/speckit.adopt`).
2. Start work with `/speckit.start` (use `--full` for complex items).
3. Implement via `/speckit.implement`; review with `/speckit.code-review` when needed.
4. Close with `/speckit.finalize` so memory stays aligned with shipped work.

## Governance

- This constitution supersedes informal chat guidance when they conflict.
- Amendments update this file and bump **Last Amended**.
- PRs and agent runs should keep `.specify/memory/` consistent with actual code and decisions.

**Version**: 0.1.1 | **Ratified**: 2026-08-12 | **Last Amended**: 2026-08-12
