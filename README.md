# Formal Methods — An Interactive Course

A self-paced course that teaches enough mathematics, enough Lean 4,
and enough programming-languages theory to read and contribute to
[cslib](https://github.com/leanprover/cslib), the Lean Computer
Science Library.

This repository currently contains the **specification** only. The
Lean project, worked examples, and exercise files are built out
module-by-module as the course is authored.

## What you'll learn

- **Mathematical background** — sets, relations, logic, induction,
  orders, fixed points, and enough type theory to read a definition.
- **Lean 4** — tactics, term mode, inductive and dependent types,
  type classes, Mathlib navigation, a taste of metaprogramming.
- **cslib** — λ-calculus, concurrency, algorithm correctness and
  complexity, Turing machines, programming-language foundations; with
  an end-of-course capstone.

## What makes it interactive

An `fmcourse` CLI and optional VS Code extension wrap the content with:

- **LLM tutor** — on-demand help when a proof stalls, without leaking
  the reference solution.
- **Progressive hints** — four graded levels (nudge → sketch →
  skeleton → full solution), each gated by explicit request.
- **Socratic end-of-module chat** — a guided dialogue that probes
  understanding and produces a gap report.
- **Web playground** — zero-install Codespaces / lean4web target for
  the earliest modules.
- **Adaptive pathing** — the Part 0 diagnostic is live; module routing
  adapts to Socratic gap reports.
- **Spaced repetition** — an SM-2 scheduler over author-written
  concept cards (Anki-exportable).

See [`INTERACTIVE.md`](./INTERACTIVE.md) for the full architecture.

## Who it's for

A working programmer who wants to do real formal methods and has no
problem reading slowly. No prior proof experience assumed.

## Start here

1. Read [`SPEC.md`](./SPEC.md) — the full specification.
2. Read [`INTERACTIVE.md`](./INTERACTIVE.md) — how the tooling works.
3. Skim [`curriculum/`](./curriculum/) — module-by-module outlines.
4. When authoring begins, a `lakefile.toml`, `FormalMethodsCourse/`
   library root, and the `fmcourse` CLI will appear; run `lake build`
   and `npx fmcourse diagnostic` to verify setup.

## Status

Draft v0.1 — specification only. See [SPEC.md §11](./SPEC.md#11-success-criteria-for-v10)
for the bar v1.0 must clear.

## License

See [LICENSE](./LICENSE).
