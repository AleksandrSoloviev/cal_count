---
description: Review the changed code of the current work item and report only real defects, maintainability, performance, and architecture problems with severity and a concrete fix.
handoffs:
  - label: Finalize Work Item
    agent: speckit.finalize
    prompt: Verify the implementation and sync durable docs
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). Treat it as scope narrowing (an explicit Git ref/range, path filter, or area of concern) or as extra context about the change. It never relaxes the qualification gate in step 5.

## Outline

Goal: Review the code delivered for the current work item and report **only real problems** — problems that can cause bugs, degrade maintainability, degrade performance, or violate the project's architecture. Run after `/speckit.implement` and before `/speckit.finalize`.

This command is read-only: it never edits code and owns no artifact. Its single output is a review report in chat.

1. Resolve review scope:
   - Read `.specify/.active-work-item.json` and locate the work-item directory. If active state is missing, continue with a Git-only scope and state that in the report header.
   - Determine the changed-code set, first match wins:
     - explicit ref/range or paths from user input;
     - uncommitted work: `git status --porcelain`, then `git diff` and `git diff --staged` for content, including untracked files;
     - branch commits: diff `HEAD` against the merge base with the default branch (`git merge-base HEAD origin/HEAD`, falling back to `main`/`master`, then `HEAD~1`);
     - files referenced by `tasks.md` when Git yields nothing — report this as degraded confidence.
   - If the scope is empty, stop and report that there is nothing to review.

2. Load the review canon (read-only). Findings must cite this canon, not personal preference:
   - `.specify/memory/constitution.md` — the project's hard principles; a violation is always a finding.
   - `.specify/memory/development/code-style.md` — enforced conventions, naming/structure rules, and test policy.
   - `.specify/memory/architecture/overview.md` and `.specify/memory/architecture/data-flow.md` — module, runtime, and data boundaries; use them to detect layering and boundary violations.
   - `.specify/memory/architecture/tech-stack.md` — approved dependencies, runtimes, and tools.
   - `.specify/memory/architecture/adr/` — accepted decisions; contradicting an accepted ADR is a finding.
   - Work-item intent: `tasks.md` and `plan.md`; `spec.md` when present (full mode); `ui-plan.md` plus `.specify/memory/ui/conventions.md` when the change touches UI.
   - If a memory file is absent, infer conventions from the surrounding code and label such findings as convention-inferred.

3. Read the changed code in context:
   - Read each changed file in full, not only diff hunks — a hunk is not reviewable without its surroundings.
   - For every changed function, type, or exported symbol, locate its callers and consumers and verify the change is safe for them. Search the repository; do not assume.
   - Note the patterns of neighbouring code. If the change follows an established local pattern, it is **not** a finding, even if you would write it differently.

4. Analysis passes over the whole scope, in order:
   - **Correctness**: wrong logic, off-by-one, inverted conditions, unhandled null/undefined/empty, wrong types or coercions, incorrect async/await, unreachable or dead branches.
   - **Contracts & compatibility**: changed signatures, return shapes, defaults, or persisted/serialised formats that break existing consumers, migrations, or stored data.
   - **Error handling & failure modes**: swallowed errors, lost context, failures that leave state partially written, missing timeouts or cancellation on external calls.
   - **Security & data safety**: injection, missing authorisation on a new path, secrets or personal data in logs, unsafe deserialisation — only where the changed code creates real exposure.
   - **Concurrency & state**: shared mutable state, races, non-idempotent retries, ordering assumptions, leaked resources or subscriptions.
   - **Performance**: only with a concrete cost argument — a query or network call inside a loop over unbounded input, an added quadratic path, a blocking call on a hot path, an unbounded cache or accumulation. No speculative micro-optimisation.
   - **Architecture & boundaries**: dependency direction violations, business logic placed in the wrong layer, bypassed abstractions, duplicated ownership of the same data or behaviour.
   - **Maintainability**: only where the next change is measurably harder — logic duplicated in a way that will drift, a name that actively misleads about behaviour, hidden coupling, or a construct the project explicitly forbids.
   - **Tests**: changed behaviour with no test where the project's test policy requires one, or a test that cannot fail.

5. Qualification gate. Before reporting anything, each candidate **MUST** pass all four checks:
   - **Reproducible**: name the file, the line or symbol, and the concrete input, state, or execution path that triggers it. If you cannot state the trigger, drop it.
   - **Not an acceptable stylistic choice**: it violates a recorded principle or convention, or it is objectively wrong. Drop it if the surrounding code deliberately does the same thing.
   - **Practically valuable**: fixing it changes runtime behaviour, prevents a plausible defect, or removes a real maintenance cost.
   - **In scope**: caused by, or directly endangered by, this change. Pre-existing issues that the change did not touch go into a separate "Pre-existing (out of scope)" list of at most three lines, without severity.

   Hard rules:
   - Do **NOT** invent findings to fill the report. An empty report is a valid and expected outcome.
   - Do **NOT** propose refactoring without a defect, a violated principle, or a measurable cost.
   - Do **NOT** report formatting, renames for taste, comment style, or equivalent alternative constructs.
   - Report each problem once, at its root cause, rather than at every place it surfaces.

6. Severity rubric. Assign the lowest severity that honestly fits:
   - **Critical** — data loss or corruption, a security hole, or breakage of a primary path. Must not merge.
   - **High** — a defect on a realistic path, a broken contract for an existing consumer, or a constitution/ADR violation. Fix before merge.
   - **Medium** — a defect on an edge path, missing error handling, a real performance regression, or a maintainability problem that will cost the next change. Fix before merge or record an explicit follow-up.
   - **Low** — narrow-impact issue or a missing test for changed behaviour. May merge with a follow-up.
   - **Nit** — non-blocking local improvement. At most three in total.

7. Output the review report in chat:
   - Header: work item, scope (ref/range or "uncommitted changes"), number of files reviewed, and any degraded-confidence note.
   - Verdict, exactly one of:
     - `READY TO MERGE` — nothing passed the gate at Critical, High, or Medium. State plainly that the code is ready to merge.
     - `CHANGES REQUESTED` — at least one Critical, High, or Medium finding.
   - Findings in descending severity, each in this shape:

     ```text
     ### [SEVERITY] Short title — path/to/file.ext:LINE

     - Problem: what is wrong, in one or two sentences.
     - Why it is a problem: the mechanism, or the cited principle/convention/ADR (quote the exact ID or file).
     - Consequences: what breaks, for whom, and under which conditions.
     - Fix: the concrete change to make, precise enough to apply directly.
     ```

   - Then a one-line coverage note per analysis pass from step 4 (`clean` or the count of findings), so the reader can see what was actually checked.
   - If nothing passed the gate, output the `READY TO MERGE` verdict with the coverage notes and no findings section. Do not append optional suggestions to compensate.
   - Never modify files in this command. Findings are recommendations for the author or for a follow-up `/speckit.implement` run.
