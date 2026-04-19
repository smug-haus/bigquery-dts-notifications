# fmcourse

Interactive companion CLI for the Formal Methods course. Pairs with
the repo root's `SPEC.md` and `INTERACTIVE.md`.

## Install (local dev)

```sh
cd tools/fmcourse
npm install
npm run build
node dist/src/cli.js --help
```

For regular use in the course repo:

```sh
npm install -g .
fmcourse --help
```

## Commands

| Command                                     | What it does                         |
|---------------------------------------------|--------------------------------------|
| `fmcourse diagnostic`                       | Run the Part 0 questionnaire.        |
| `fmcourse progress`                         | Show routing, completion, gaps.      |
| `fmcourse complete <module>`                | Mark a module complete.              |
| `fmcourse hint --exercise <id> --level N`   | Serve a progressive hint.            |
| `fmcourse tutor <file>`                     | Ask the LLM tutor (requires key).    |
| `fmcourse socratic <module>`                | End-of-module Socratic dialogue.     |
| `fmcourse review [--new N]`                 | SM-2 spaced-repetition review.       |
| `fmcourse srs export-anki --out <path>`     | Export cards as Anki TSV.            |

## Environment

- `ANTHROPIC_API_KEY` — required for `tutor` and the online Socratic
  chat. Absent, those commands run deterministic offline fallbacks.
- `FMCOURSE_MODEL` — model name override. Defaults to
  `claude-sonnet-4-6`.
- `FMCOURSE_DEBUG=1` — print stack traces on error.

## State

Two files:

- `PROGRESS.json` (in the repo) — learner-level routing and completion.
  Committed.
- `~/.fmcourse/state.json` — local hint-grant log, SRS schedule,
  transcripts. Not committed.

## Safety invariants

The tutor's context builder is forbidden from reading
`FormalMethodsCourse/Solutions/**` (enforced in `src/context.ts`:
`assertNotSolution`). The hint system exposes solutions only when a
learner passes `--reveal` and records a reflection.

## Tests

```sh
npm test
```

Pure unit tests — no network, no LLM, no Lean toolchain required.
