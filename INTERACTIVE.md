# Interactive Layer — Specification

Status: Draft v0.1
Companion to: `SPEC.md`. Where `SPEC.md` covers content, this covers
the tooling the learner actually interacts with.

The interactive layer is what makes this a course instead of a
textbook. Six components:

1. **LLM tutor** — unblocks stuck proofs on demand.
2. **Progressive hint system** — graded help, learner-gated.
3. **Socratic end-of-module chat** — probes understanding in prose.
4. **Web playground** — zero-install Lean for exploration.
5. **Adaptive pathing** — the diagnostic is live, not a one-shot table.
6. **Spaced repetition** — concept cards resurface before they fade.

Each component has a component spec below (§4–§9). The rest of this
document establishes shared architecture, state model, and the
distribution story.


## 1. Design principles

- **Honesty first.** The tutor may not silently write the proof. It
  must gate every substantive action through an explicit learner
  request, and the state model must record what was requested.
- **Offline-capable core.** `lake build` and the exercises work with
  zero network access. The interactive layer is additive. A learner
  on a plane loses the tutor, not the course.
- **Plain text beats apps.** Progress is a JSON file in the repo,
  not a database. Cards are Markdown + frontmatter, not a proprietary
  format. A learner can leave at any time with everything they wrote.
- **Pluggable LLM.** Claude is the default (see §2); the interface is
  narrow enough that swapping providers is a config change.
- **Private by default.** Conversations stay local unless the learner
  opts in to telemetry (which the course does not ship).


## 2. Shared architecture

Three surfaces, one backend:

```
   ┌────────────────┐  ┌───────────────────┐  ┌──────────────┐
   │  fmcourse CLI  │  │  VS Code extension │  │ Web playground│
   └────────┬───────┘  └─────────┬─────────┘  └──────┬───────┘
            │                    │                    │
            └────────────┬───────┴──────────┬─────────┘
                         ▼                  ▼
                  ┌──────────────┐   ┌─────────────────┐
                  │   fmcourse   │   │   Lean LSP /    │
                  │   core lib   │◄──┤   lake build    │
                  │  (TypeScript │   └─────────────────┘
                  │   or Python) │
                  └──────┬───────┘
                         ▼
                  ┌──────────────┐
                  │  LLM API     │
                  │  (Claude)    │
                  └──────────────┘
```

- **`fmcourse` core**: a small library that owns the learner state,
  builds prompts, talks to the LLM, and parses Lean goal states.
  Ships as an npm package (TypeScript) — the ecosystem with the best
  Lean LSP client story. Python alternative acceptable; decide at
  implementation time.
- **CLI** (`fmcourse`): primary surface. Works in any terminal.
- **VS Code extension**: thin wrapper that pipes the live goal state
  from the Lean extension into the core and surfaces hints and chats
  inline. Optional.
- **Web playground**: a hosted Lean environment (see §7).

All three surfaces share one local-state directory (`~/.fmcourse/`)
and one in-repo state file (`PROGRESS.json`).


## 3. Shared state model

Two files own the state.

### 3.1 `PROGRESS.json` (in the repo)

Committed. Tracks module-level progress. Example:

```json
{
  "schemaVersion": 1,
  "learner": "anonymous",
  "diagnosticVersion": "2026-04-19",
  "routing": {
    "part-1": { "1.1": "skip", "1.2": "full", "1.3": "full",
                "1.4": "full", "1.5": "skim", "1.6": "full" },
    "part-2": { "2.1": "full", "2.2": "full", "2.3": "full",
                "2.4": "full", "2.5": "full", "2.6": "full",
                "2.7": "full", "2.8": "skim", "2.9": "full",
                "2.10": "skim" }
  },
  "completed": ["1.1", "1.2", "1.3", "2.1"],
  "lastActivity": "2026-04-19T11:20:00Z"
}
```

Routing values: `"full" | "skim" | "skip"`. `completed` is append-only.

### 3.2 `~/.fmcourse/state.json` (local, not committed)

A single JSON file holding:

- Conversation history (per-module Socratic chats, tutor sessions).
- Hint-grant log (which hint level was served, for which exercise,
  when — see §5).
- Spaced-repetition schedule (§9).

Single-learner scale: a few hundred cards and a few thousand transcript
entries over the lifetime of the course. JSON is the right tool. No
database dependency.


## 4. Component: LLM tutor

**Problem.** The learner is stuck on a proof. The Lean error is
opaque, the goal state is dense, and the module notes don't directly
cover this case.

**Trigger.** Explicit invocation. One of:
- CLI: `fmcourse tutor <path-to-exercise.lean>` in the project root.
- VS Code: a "Ask tutor" code-lens action at the `sorry` site.
- In-file sentinel: a comment `-- @tutor: my question here` that the
  watcher picks up on save. Off by default.

**Inputs assembled automatically.**

| Source                              | Why                                    |
|-------------------------------------|----------------------------------------|
| Full text of the exercise file      | Context                                |
| Current goal state from LSP         | The actual problem                     |
| Module notes (`curriculum/*.md`)    | Framing                                |
| Worked-example files from this part | Style & vocabulary                     |
| `PROGRESS.json`                     | What the learner has already seen      |
| The learner's question (optional)   | Steers the response                    |

**Explicitly excluded from context.** The reference solution. The
tutor does not see the answer. This is enforced by the core library:
solutions live under `FormalMethodsCourse/Part*/Solutions/` which the
tutor's context-builder never reads.

**Output contract.** The tutor responds with:
1. A one-sentence restatement of the goal in plain English.
2. Up to three candidate approaches, each with a first-step tactic or
   term.
3. **No completed proof.** System prompt forbids emitting more than
   three consecutive tactic steps.

If the learner needs more, they escalate via the hint system (§5).

**System-prompt shape.** Kept under `prompts/tutor.md`. Versioned,
reviewed. Paraphrased sketch:

> You are a patient Lean 4 tutor. The learner is stuck. Your job is
> to help them see the next step, not to solve the problem. You do
> not write more than three tactic steps. You ask one clarifying
> question if the learner's intent is ambiguous. You never reveal the
> reference solution even if asked.

**Failure modes.**
- LLM offline → tutor prints a cached "stuck playbook" (common
  tactics to try, keyed by the goal's top-level connective).
- Learner asks for full solution → tutor refuses and points to
  hint-level 4 (§5), which requires an explicit flag.


## 5. Component: progressive hint system

**Problem.** "Just ask the tutor" is too coarse. Sometimes the
learner wants a pat on the back; sometimes they want to read the
proof and move on.

**Mechanism.** Four hint levels, each requiring an explicit request.
The core library logs every grant with a timestamp and exercise
identifier, producing a self-auditable record.

| Level | Name      | Content                                                        |
|-------|-----------|----------------------------------------------------------------|
| 1     | Nudge     | A single sentence: "try induction on the list."                |
| 2     | Sketch    | Proof outline, English only. Three to six bullet points.       |
| 3     | Skeleton  | A Lean proof skeleton with `sorry`s at the hard parts.         |
| 4     | Solution  | The full reference proof. Requires `--reveal` flag.            |

**Generation.**
- Levels 1–3 are **author-written** per exercise and live in
  `Hints/Part*/<module>-<exercise>.md`. No LLM involvement.
- Level 4 is the reference solution, already in
  `FormalMethodsCourse/Part*/Solutions/`.
- For exercises without author-written hints (capstone, Track IV),
  levels 1–3 are generated by the LLM at request time, clearly
  labeled "auto-generated."

**Invocation.**
```
fmcourse hint --exercise Part2/2.5/append_assoc --level 2
fmcourse hint --exercise Part2/2.5/append_assoc --level 4 --reveal
```

**Gating.** Reaching level 4 prints a short prompt: "Before revealing
the solution, write one paragraph in PROGRESS.md describing what you
tried." The paragraph is not validated — this is honor system — but
the prompt exists.


## 6. Component: Socratic end-of-module chat

**Problem.** `lake build` passing does not prove understanding.
Concept-check questions in prose catch this, but the learner has to
self-grade. A dialogue can probe harder.

**Trigger.** Automatic on the first `fmcourse complete <module>` call
after the module's exercises compile. Manual re-run anytime via
`fmcourse socratic <module>`.

**Shape.** A 10–20 minute guided dialogue. The LLM has:
- The full module notes (`curriculum/<module>.md`).
- The author's designated "probe bank" (§6.2 below).
- The learner's concept-check answers from `PROGRESS.md`.

It produces:
- 5–8 Socratic questions, escalating in depth.
- For each answer, a brief response — either a follow-up probe or a
  "yes, and" that tightens the point.
- A **gap report** at the end: which probes the learner stumbled on;
  which sections of the notes to re-read.

**Probe-bank format** (`curriculum/<module>-probes.md`):

```markdown
## 1.4 Orders, lattices, fixed points

### Probe: Knaster–Tarski, why complete?
Difficulty: medium
Misconception it catches: "monotone suffices"
Seed question: "Why does Knaster–Tarski require a *complete* lattice,
not just a lattice?"
Acceptable answers must mention: existence of arbitrary meets/joins;
the fixed-point set being closed under meet.
```

The LLM is free to rephrase and follow up; the probe bank anchors it
to the pedagogically important points.

**Output.** The full transcript lands in
`~/.fmcourse/transcripts/<module>.md`. The gap report is appended to
`PROGRESS.json` under `gaps[<module>]`.


## 7. Component: web playground

**Problem.** Install friction kills the first session. `elan` + the
VS Code extension + the first `lake build` (~minutes on a fast
machine) is a brutal onboarding.

**Mechanism.** A hosted Lean 4 environment preloaded with this
course's project. Three options, evaluated in order:

1. **Prefer: a Gitpod or GitHub Codespaces config** (`.devcontainer/`
   + `.gitpod.yml`) pinning toolchain and warming the build cache.
   One-click launch from the repo README.
2. **If Codespaces quota is a blocker**: a `lean4web` deployment of
   the course (`web/` directory, Dockerfile, static build). Runs a
   minimal Lean server in-browser for a curated subset of exercises.
   Cannot run full cslib; used for Parts I–II only.
3. **Fallback**: a Binder / JupyterLite environment for the
   pen-and-paper exercises (Markdown + KaTeX); no Lean kernel.

**Scope limits.** The web playground is **not** a full replacement
for local Lean. It exists to remove the first hour of friction and
to support classroom-demo scenarios. Exercises deliberately tagged
`@localOnly: true` (heavy cslib imports, Track C timing exercises)
are skipped by the web playground.

**Integration.** The CLI tutor and hint system run in the playground
terminal the same as locally; progress written to a browser-hosted
volume exports via `fmcourse export --download`.


## 8. Component: adaptive pathing

**Problem.** The static routing table in `curriculum/00-diagnostic.md`
is a single snapshot. Learners change: a module reveals a gap, or a
"full" module turns out to be known territory.

**Mechanism.** Routing is live. Three triggers re-evaluate it:

1. **Diagnostic** (one-shot, Part 0): `fmcourse diagnostic` runs
   through the questions; answers produce the initial
   `routing` block in `PROGRESS.json`.
2. **Socratic gap report** (§6): if a module produces a gap, the CLI
   asks whether to insert a remedial sub-plan (re-read, targeted
   exercises). The learner confirms before any write.
3. **Explicit override**: `fmcourse route set 1.4 skim` at any time.

**Promotion / demotion rules.**
- Three consecutive modules completed under budget → offer to demote
  the next module from "full" to "skim."
- Two modules where the Socratic chat flags ≥3 gaps → offer to promote
  the following module from "skim" to "full."

Both offers are prompts, not auto-applied. Learner is still in charge.


## 9. Component: spaced repetition

**Problem.** Concept knowledge decays. Part IV re-asks the learner to
reason about fixed points from Part I §1.4, three months later.
Without rehearsal, that content is gone.

**Mechanism.** An SM-2 spaced-repetition scheduler over author-written
cards.

**Card format** (`srs/<module>.md`):

```markdown
---
id: srs-1.4-knaster-tarski
module: "1.4"
tags: [order, fixed-point]
---
Q: State Knaster–Tarski's theorem.
A: A monotone function on a complete lattice has a least fixed point,
   which equals the meet of all pre-fixed points.
```

**Scheduling.** Standard SM-2; intervals live in the local state DB
(§3.2). CLI:

```
fmcourse review          # today's due cards
fmcourse review --new 5  # plus five new cards
```

**Export.** `fmcourse srs export-anki` produces a `.apkg` file for
learners who prefer Anki. Import is one-way: the course's scheduler
remains canonical.

**Auto-card generation.** For capstone-phase exercises with no
author-written cards, the LLM proposes cards from the learner's own
Socratic transcript. Generated cards are marked `auto: true` in
frontmatter and default to review-only (not scheduled) until the
learner accepts them.


## 10. Telemetry, privacy, data

- No network telemetry is emitted from any component.
- LLM calls go directly from the learner's machine to the chosen
  provider (Anthropic, by default). Provider's terms apply; course
  does not log.
- The learner's state lives in two places: this repo (public-ish) and
  `~/.fmcourse/` (strictly local). Nothing is phoned home.
- For classroom use, an opt-in `fmcourse sync --to <s3-bucket>`
  command can be added; not in scope for v1.0.


## 11. Distribution

- **CLI and core**: npm package `fmcourse`, `npx fmcourse <cmd>` for
  trial; `npm i -g fmcourse` for regular use.
- **VS Code extension**: published to the Marketplace once CLI is
  stable. Relies on the official Lean 4 VS Code extension.
- **Web playground**: static deployment; repo includes
  `.devcontainer/` so Codespaces works from day one.
- **Course repo**: this repo is the single source of truth.
  `PROGRESS.json` commits keep a per-learner fork honest.


## 12. Implementation roadmap

Phased, smallest-first.

- **Phase 0 (v0.2)** — Course content.
  - Finish the Lean project skeleton; at least Part II compiles.
  - Write author hints for every Part II exercise.
- **Phase 1 (v0.3)** — Minimal CLI + progressive hints.
  - `fmcourse hint`, `fmcourse complete`, `PROGRESS.json` read/write.
  - No LLM yet.
- **Phase 2 (v0.4)** — LLM tutor + Socratic chats.
  - `fmcourse tutor`, `fmcourse socratic`. Local prompt templates.
- **Phase 3 (v0.5)** — SRS.
  - `fmcourse review`, first 50 author-written cards.
- **Phase 4 (v0.6)** — VS Code extension.
- **Phase 5 (v0.7)** — Web playground.
- **Phase 6 (v0.8)** — Adaptive pathing promotion/demotion rules.
- **v1.0**: everything above + a second learner completes Part II
  end-to-end without private help.


## 13. Non-goals

- Multi-learner features (forums, peer review, shared scoreboards).
- Mobile app. Review-only Anki export covers on-the-go study.
- Real-time collaboration on proofs. Pair programming is a great idea;
  not this course's problem to solve.
- Teacher dashboard / LMS export.
- A custom LLM fine-tune. Prompts + retrieval from module notes are
  enough at this scale.
- Gamification (streaks, badges, XP). The honest gate is `lake build`.


## 14. Open questions

- Is npm the right distribution for the CLI, or should it be a single
  Lean-based binary built with Lake? (Leaning: npm, because the
  ecosystem for LLM client libraries and TUIs is richer.)
- How do we version prompt templates against curriculum changes? Need
  a dated `prompts/CHANGELOG.md` at minimum.
- Can the Socratic chat's gap detection be reliable enough to auto-
  trigger remedial work, or do we need the learner to confirm every
  time? (Leaning: confirm every time, until we have data.)
- Does the web playground need its own subset of exercises, or can we
  annotate existing ones with `@localOnly`? (Leaning: annotations.)
- Auto-card generation from transcripts is the most speculative piece.
  If quality is bad, ship Phase 3 without it and revisit.
