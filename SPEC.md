# Formal Methods Course — Specification

Status: Draft v0.1
Audience: self-learner with programming background, limited formal math
Goal: produce a single learner fluent in Lean 4 and able to read,
contribute to, and reason about cslib.

This is the authoritative spec. `INTERACTIVE.md` specifies the
tooling that makes the course interactive (LLM tutor, hints, Socratic
chats, web playground, adaptive pathing, spaced repetition). The
`curriculum/` directory refines each part into modules. The Lean
source tree (to be created) implements the exercises.


## 1. Goals

Three concurrent learning tracks, braided into one course:

1. **Mathematical maturity**: the minimum working vocabulary of sets,
   relations, functions, orders, induction, and constructive logic needed
   to read a definition or theorem statement without translation.
2. **Lean 4 fluency**: reading and writing definitions, tactic proofs,
   and term-mode proofs; comfort with dependent types, inductive types,
   type classes, and Mathlib navigation.
3. **cslib literacy**: ability to open any cslib file (λ-calculus,
   concurrency, algorithms, Turing machines, PL foundations) and follow
   the development; ability to formalize a small theorem in the same
   style.

The course is a means, not an end. Success = the learner can pick up a
research paper in PL or concurrency theory and start formalizing it.


## 2. Non-goals

- **Not a math degree.** We teach enough set theory, logic, and type
  theory to read cslib. We do not cover measure theory, algebraic
  topology, category theory beyond essentials, etc.
- **Not Mathlib contribution training.** Mathlib is touched as a
  dependency and reference, not a deliverable.
- **Not a Lean 3 bridge.** Lean 4 only.
- **Not a software-verification survey.** We cover the methods needed
  to reason about cslib's models of computation; Dafny, TLA+, Coq,
  Isabelle, Agda get at most comparison notes.


## 3. Prerequisites

Assumed:
- Working programmer. Reads types in a typed language (Rust, Haskell,
  TypeScript, OCaml, Scala all fine).
- Comfort with recursion and induction at the "write a recursive tree
  traversal" level.
- Willingness to read carefully. Formal methods is a slow-reading
  discipline.

Not assumed:
- Prior proof experience.
- Prior Lean experience.
- University-level real analysis or abstract algebra.

A **pre-flight diagnostic** (curriculum/00-diagnostic.md) calibrates the
starting point and can route the learner past Part I modules they
already know.


## 4. Shape of the course

Five parts plus a capstone. Each part is gated: Part N+1 is not
unlocked until Part N's proof obligations compile without `sorry`.

| Part | Name                              | Est. hours | Gate                                            |
|------|-----------------------------------|------------|-------------------------------------------------|
| I    | Mathematical Foundations          | 40–60      | Pen-and-paper + Lean exercises compile          |
| II   | Lean 4 as a Proof Assistant       | 50–70      | All tactic/term exercises compile               |
| III  | Formal Methods Bridge             | 40–60      | Operational-semantics + type-system proofs      |
| IV   | cslib Deep Dives                  | 60–100     | Re-derivation of one theorem per subtopic       |
| V    | Capstone                          | 30–60      | Learner-chosen formalization, reviewed by CI    |

Total: roughly 220–350 hours. At 8 hrs/week, 7–10 months.


## 5. Pedagogical model

Each module has four content surfaces and a layer of interactive
tooling over them.

**Content surfaces.**

1. **Notes** (`curriculum/<module>.md`): prose exposition. Written at
   "Software Foundations" density — carefully, with examples, not as
   bullet-point reference. ~1,500–4,000 words per module.
2. **Worked examples** (`.lean`): annotated proofs, read-only. The
   learner reads, runs, and tweaks; not graded.
3. **Exercises** (`.lean` with `sorry`): the learner fills in holes.
   CI rejects any `sorry` in submitted work.
4. **Concept checks** (`curriculum/<module>-checks.md`): 3–8 short
   prose or pen-and-paper questions with hidden answers. Forces the
   learner to articulate ideas, not just click through tactics.

**Interactive surfaces** (detailed in `INTERACTIVE.md`).

1. **LLM tutor** — on-demand help when a proof stalls; context-aware
   but forbidden from seeing the reference solution.
2. **Progressive hints** — four graded levels (nudge → sketch →
   skeleton → full solution); author-written for core exercises,
   LLM-generated only where marked.
3. **Socratic chat** — an end-of-module dialogue that probes
   understanding in prose and produces a gap report.
4. **Web playground** — a zero-install Codespaces/lean4web target for
   Parts I–II exercises, to collapse onboarding friction.
5. **Adaptive pathing** — the diagnostic is live; module routing
   (`full` / `skim` / `skip`) can be re-negotiated after Socratic
   gaps.
6. **Spaced repetition** — an SM-2 scheduler over author-written
   cards, to keep earlier material from decaying.

Progression through a module: read notes → run worked examples →
complete exercises (tutor and hints available on demand) → answer
concept checks → Socratic chat → `lake build`. The final step is the
honest gate. SRS reviews run in parallel, independent of the module
you're currently on.

**No video lectures.** Text scales, is greppable, and matches how
formal methods is actually practiced.


## 6. Curriculum

### Part I — Mathematical Foundations

Detailed in `curriculum/01-mathematical-foundations.md`.

1.1  Sets, functions, relations
1.2  Propositional and predicate logic; natural deduction
1.3  Induction: structural, strong, well-founded
1.4  Orders, lattices, fixed points (Knaster–Tarski, Kleene)
1.5  Constructive vs. classical logic; the BHK interpretation
1.6  Type theory, intuitively: propositions as types, proofs as programs

Exercises are dual-mode: pen-and-paper proof first, then Lean
formalization of the same statement in a provided scaffold.

### Part II — Lean 4 as a Proof Assistant

Detailed in `curriculum/02-lean-proof-assistant.md`.

2.1  Install, Lake, elan, VS Code; `#check`, `#eval`, `#print`
2.2  Functions, `def`, pattern matching, recursion, termination
2.3  Inductive types: `Nat`, `List`, `Vec`, `Tree`
2.4  Propositions as types; `Prop` vs. `Type`; `fun`/`have`/`show`
2.5  Tactics: `intro`, `exact`, `apply`, `rfl`, `rw`, `simp`, `cases`,
     `induction`, `refine`, `exists`, `constructor`, `decide`,
     `omega`, `linarith`
2.6  Dependent types and the universe hierarchy
2.7  Type classes: `Decidable`, `Inhabited`, `Monad`, `Functor`
2.8  Structures and typeclass-based algebra (`Preorder`, `Monoid`…)
2.9  Navigating Mathlib: search, naming conventions, namespaces
2.10 Metaprogramming preview: `elab`, `macro`, custom tactics

### Part III — Formal Methods Bridge

Detailed in `curriculum/03-formal-methods-bridge.md`.

3.1  Syntax vs. semantics; BNF, abstract syntax, de Bruijn indices
3.2  Small-step and big-step operational semantics
3.3  Simply-typed λ-calculus; progress and preservation
3.4  Subject reduction, strong normalization sketch
3.5  Bisimulation and contextual equivalence (intro)
3.6  Denotational semantics preview; domain theory bare minimum

This is the bridge: the learner has Lean and math; here they formalize
PL metatheory from scratch in Lean, imitating cslib's style but
without importing it yet.

### Part IV — cslib Deep Dives

Detailed in `curriculum/04-cslib-deep-dives.md`. Four tracks; the
learner must complete at least two and skim the rest.

4.A  **λ-calculus in cslib**: untyped, simply-typed, System F. Re-prove
     one confluence or normalization lemma from the library.
4.B  **Concurrency theory**: CCS/π-calculus fragments; structural
     congruence, labelled transitions, bisimulation in Lean.
4.C  **Algorithms + complexity**: a sorting or graph algorithm with
     formal correctness and a running-time bound. Emphasis on the
     complexity-theoretic modeling (cost monad / step counting).
4.D  **Turing machines and decidability**: encoding, halting, a
     decidability or undecidability result at small scale.

Each track ends with: "open the cslib file, read it end-to-end, and
explain three design choices the authors made."

### Part V — Capstone

Detailed in `curriculum/05-capstone.md`.

Learner chooses one:
- Formalize a small language's type soundness (e.g., STLC + sums + refs).
- Formalize a textbook theorem (Rice, pumping lemma, Kleene's theorem).
- Formalize a concurrency protocol (leader election on a ring, two-phase
  commit safety).
- Contribute a new lemma or cleanup to cslib's actual repository.

Deliverable: a Lean project, a 2,000-word write-up, and a recorded
10-minute walkthrough (self-review, not graded by anyone else).


## 7. Technical implementation

### 7.1 Repository layout (target state)

```
.
├── README.md                     entry point, quick-start
├── SPEC.md                       this file
├── INTERACTIVE.md                interactive-layer specification
├── curriculum/                   prose notes per module
│   ├── 00-diagnostic.md
│   ├── 01-mathematical-foundations.md
│   ├── 02-lean-proof-assistant.md
│   ├── 03-formal-methods-bridge.md
│   ├── 04-cslib-deep-dives.md
│   ├── 05-capstone.md
│   └── <module>-probes.md        Socratic probe banks (per module)
├── lakefile.toml                 Lean project manifest
├── lean-toolchain                pinned toolchain (matches cslib)
├── FormalMethodsCourse/          library root
│   ├── Part1/                    one file per module; worked examples
│   ├── Part2/
│   ├── Part3/
│   └── Part4/
├── Exercises/                    same shape as FormalMethodsCourse/
│   ├── Part1/                    files contain `sorry` holes
│   ├── Part2/
│   ├── Part3/
│   └── Part4/
├── Hints/                        author-written progressive hints
│   └── Part*/<module>-<exercise>.md
├── srs/                          spaced-repetition card decks
│   └── <module>.md
├── prompts/                      LLM system prompts (versioned)
│   ├── tutor.md
│   ├── socratic.md
│   └── CHANGELOG.md
├── tools/fmcourse/               CLI + core library (npm package)
├── .devcontainer/                Codespaces / web playground config
├── web/                          optional lean4web deployment
├── PROGRESS.json                 learner state (committed)
├── test/                         sanity tests: no `sorry` in Exercises/,
│                                 every module has `.lean` + probes
└── .github/workflows/            CI: lake build + `sorry` check +
                                  probe-bank / hint coverage checks
```

The spec itself does not ship Lean code. Part of the course is the
learner (or an AI collaborator) scaffolding the project during Part II.

### 7.2 Lean toolchain

Pin to whatever cslib's `lean-toolchain` currently tracks. cslib is
added as a dependency via `lakefile.toml`:

```toml
[[require]]
name = "cslib"
scope = "leanprover"
rev = "main"
```

Parts I–III do not import cslib; they re-derive basics to build
understanding. Part IV imports it explicitly.

### 7.3 CI gate

A GitHub Actions workflow:

1. `lake build` must succeed for the whole tree.
2. A grep-based `sorry` check fails the build if `sorry` appears
   anywhere under `Exercises/`.
3. A simple script in `test/` verifies every module referenced by
   `curriculum/` has a matching `.lean` file, a probe bank
   (`curriculum/<module>-probes.md`), author-written hints for every
   exercise not tagged `@autoHint: true`, and at least one SRS card
   under `srs/<module>.md`.
4. The `fmcourse` CLI package under `tools/fmcourse/` builds and
   passes its own unit tests.

The CI gate is the honest assessment. There is no grader.

### 7.4 Module skeleton

Each exercise file follows:

```lean
-- Exercises/Part2/02_Induction.lean
import FormalMethodsCourse.Part2.Setup

namespace Part2.Induction

/-- Exercise 2.3.1: sum of first n naturals. -/
theorem sum_range (n : Nat) :
    2 * (Finset.range n).sum id = n * (n - 1) := by
  sorry

end Part2.Induction
```

The worked-example counterpart lives in `FormalMethodsCourse/Part2/`
with the proof filled in and narrated.

### 7.5 Interactive layer

The interactive layer is specified in full in `INTERACTIVE.md`.
Summary of the architecture:

- A small `fmcourse` CLI (and optional VS Code extension) owns
  learner state, talks to the Lean LSP, and brokers LLM calls.
- Three surfaces (CLI, VS Code, web playground) share one core
  library and two state files: `PROGRESS.json` (in the repo) and
  `~/.fmcourse/state.json` (local).
- LLM provider is pluggable; Claude is the default.
- The tutor is forbidden from reading `FormalMethodsCourse/Part*/Solutions/`.
- Everything works offline except the tutor and Socratic chat; those
  degrade to cached playbooks when the network is unavailable.

See `INTERACTIVE.md` §12 for the phased implementation roadmap.


## 8. Assessment

There is no instructor. The learner's confidence in their own
knowledge is calibrated by:

- **CI pass** = necessary, not sufficient. A tactic script can pass
  without understanding.
- **Concept checks** = the sufficiency test. If the learner cannot
  write the plain-English answer, `lake build` lied.
- **Capstone** = the integration test. Pulling everything together on a
  learner-chosen problem is the real assessment.

A lightweight progress log in `PROGRESS.md` (to be generated) records
module completion dates. This is for personal calibration, not grades.


## 9. Dependencies and versions

- Lean 4 — pinned via `lean-toolchain`, tracking cslib.
- Mathlib — pulled transitively by cslib.
- cslib — `leanprover/cslib`, `rev = "main"` during the course;
  pinned to a commit before capstone.
- VS Code + Lean4 extension, or any editor with the Lean language
  server.

No other runtime dependencies. No web app. No custom tooling beyond
`lake` and `git`.


## 10. Out of scope (explicitly)

- Hosting for paid learner accounts, LMS integration, grading
  infrastructure for classrooms.
- Collaborative cohorts, forums, Discord.
- A "certificate." The capstone write-up is the artifact.
- Localization. English only.
- Accessibility audit of generated PDFs (none are generated).
- A custom LLM fine-tune for the tutor. Prompts + retrieval over
  module notes are sufficient at this scale.
- Mobile / native-GUI applications. Anki export covers mobile SRS.


## 11. Success criteria for v1.0

This repository ships v1.0 when:

1. All five curriculum files exist at the density described in §5.
2. Every module listed in §6 has a worked-example `.lean` file, a
   corresponding `Exercises/` file, a probe bank under
   `curriculum/<module>-probes.md`, author-written hints under
   `Hints/`, and at least three SRS cards under `srs/`.
3. `lake build` succeeds from a clean clone.
4. A capstone reference solution exists for at least one of the four
   tracks in §6 Part V.
5. The `fmcourse` CLI implements every command named in
   `INTERACTIVE.md` §§4–9 and its unit tests pass in CI.
6. The Codespaces/devcontainer path launches and completes at least
   one Part II exercise without a local Lean install.
7. A second learner (not the author) completes the diagnostic and Part
   II without private help and reports no blocking defects, with
   Socratic transcripts archived under `~/.fmcourse/transcripts/`.

Anything short of this is v0.x and should be labeled as such. The
phased roadmap in `INTERACTIVE.md` §12 defines intermediate v0.x
milestones.


## 12. Revision policy

- This SPEC.md is canonical. Changes go through a PR with a "Why"
  section.
- `curriculum/*.md` files may be edited freely during authoring; once a
  module is gated (its Exercises file is checked in and passes CI),
  further edits preserve the API of existing exercise names.
- Lean file renames require a deprecation stub for one release cycle.


## 13. Open questions

Tracked in `curriculum/00-diagnostic.md` as they are resolved:

- Should Part I teach classical logic at all, or only constructive?
  (Leaning: constructive first, classical as a named escape hatch.)
- Is a dedicated category-theory module warranted, or do we inline
  what's needed? (Leaning: inline.)
- How much automation (`simp` sets, custom tactics) is fair game in
  Exercises? (Leaning: cap at what Part II §2.10 introduces.)
- Does the capstone cslib-contribution path require a mentor?
  (Leaning: yes, but out of scope for this repo.)
