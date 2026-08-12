---
description: Verify implementation quality and sync durable knowledge.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. Resolve active work item:
   - Read `.specify/.active-work-item.json` and locate work-item directory.
   - Error clearly if active state is missing.

2. Load verification inputs:
   - Required: `tasks.md`, `plan.md`
   - Optional: `spec.md` (full mode)
   - Required: `.specify/memory/constitution.md`
   - For UI sync (only if the work item has a `ui-plan.md`): load **read-only** the durable UI memory that step 6 updates — `.specify/memory/ui/screens.md` and `.specify/memory/ui/navigation.md`. Step 6 updates CHANGED rows / nav edges **in place** and must not collide a NEW `SCREEN-<slug>` with an existing one, so the current registry and navigation graph have to be in context before the sync.
   - Optional: `.specify/templates/finalize-report-template.md` as report structure reference.

3. Verify implementation completeness:
   - Evaluate each task from `tasks.md` against implementation evidence.
   - If `spec.md` exists, verify acceptance scenarios/requirements coverage.
   - Record pass/fail with concise evidence notes.

4. Constitution compliance:
   - Check each principle in `.specify/memory/constitution.md` against delivered work.
   - Mark PASS/WARN/FAIL with rationale.

5. Best-effort local verification:
   - Discover and run relevant commands when available:
     - `pytest`
     - `npm test`
     - `cargo test`
     - `make test`
   - If none are available, report graceful skip.

6. Durable docs sync:
   - Update `.specify/memory/` files for any durable architectural/convention decisions discovered during implementation. `/speckit.adopt` seeds the core durable docs below once at bootstrap; finalize is the only step that refreshes them afterward, so keep them current. Update **only if this work item changed the corresponding reality**, else leave untouched:
     - `architecture/tech-stack.md`: if you added/removed/version-bumped a dependency, runtime, or tool.
     - `architecture/overview.md`: if you added a new module, component, or runtime boundary.
     - `architecture/data-flow.md`: if a data source, persistence boundary, or processing/failure path changed.
     - `development/code-style.md`: if you introduced or changed a convention, naming/structure rule, or test policy.
     - `context.md`: if scope, supported runtime/mode, primary users, or a non-goal changed.
     - Record only durable facts discoverable from the repo; do NOT log one-off implementation details.
   - UI memory sync: if the work item has a `ui-plan.md`, extract the durable parts and update `.specify/memory/ui/`:
     - SCREEN REGISTRY `ui/screens.md`: for each SCR in "Screen Overview" — NEW → add a row (assign a stable ID SCREEN-<slug> from the name/route; record route, archetype, controller, last-touched = current work item); CHANGED → update the existing SCREEN-<slug> row (route/archetype/controller if they changed) + bump last-touched. Do NOT copy concrete ST/IX.
     - NAVIGATION MAP `ui/navigation.md`: add/update transition edges (from §"Route & Context" and §"Interactions & Navigation": SCR → route/SCR) and guards.
     - UI CONVENTIONS `ui/conventions.md`: UI-modeling conventions (forms = FormState, pagination = flags in `loaded`, regions for composite), reusable components extracted into a shared layer, and design-token mappings / theme conventions.
     - Decisions about navigation or the state model that rise to architectural → `architecture/adr/` (a new ADR + a row in the index).
     - One-off data (this feature's concrete ST/IX/test matrix) is NOT carried into memory — it stays a snapshot in `specs/NNN/ui-plan.md`. [Optional (ii) for screens hit by 3+ features: merge the full state model into `ui/screens/<slug>.md`.]
   - Never delete, move, or archive work-item artifacts in `specs/`.

7. Output a structured finalize report in chat using sections from `finalize-report-template.md`:
   - Header (work item, mode, date)
   - Task verification
   - Spec verification (full mode only)
   - Constitution compliance
   - Local verification
   - Durable docs updated (include a "UI: updated durable docs" subsection — registry/navigation/conventions — or "UI: nothing to sync")
   - Completion summary
