# Part V — Capstone

Goal: the learner produces an original piece of formal work, end to
end. This is the integration test for everything above.

Estimated time: 30–60 hours.


## Options

Pick exactly one. The choice should be made at the end of Part III
and refined during Part IV.

### Option 1 — Language type soundness

Formalize type soundness for a language extending STLC with at least
two of: sums, products, references, exceptions, recursion. "At least
two" so the exercise is not a reskin of Part III.

Deliverable:
- Lean project compiling the language, its operational semantics, its
  typing judgment, and type soundness.
- Short README documenting design choices and open corners.

---

### Option 2 — Textbook theorem

Pick one "textbook" result outside Part III's scope and formalize it.
Suggested pool:
- Rice's theorem.
- The pumping lemma for regular languages.
- Kleene's theorem (regex ↔ DFA).
- Arden's lemma + its use.
- Böhm's theorem for the untyped λ-calculus (stretch).

Deliverable:
- Lean project with the theorem proved from first principles or atop
  cslib, at your discretion.
- A written summary comparing your proof to the textbook argument;
  where did Lean demand more than the book?

---

### Option 3 — Concurrency protocol

Formalize a small protocol and a safety property.

Pool:
- Two-phase commit safety (no disagreement) under crash-free
  assumptions.
- Peterson's mutex.
- Leader election on a unidirectional ring, terminating version.
- A CRDT convergence proof (G-counter or OR-set).

Deliverable:
- Protocol model in Lean, in cslib's concurrency vocabulary where
  applicable.
- Safety property stated and proved.
- One page on what the model cheats — every concurrency model cheats
  somewhere; honesty is part of the deliverable.

---

### Option 4 — Contribute to cslib

This is the real-world path. Find an open issue or `sorry` in cslib,
propose a solution, iterate with maintainers, and land a PR.

Deliverable:
- Link to merged PR (or long-lived draft if maintainers are slow —
  engagement counts).
- A write-up of the iteration process: what you submitted, what you
  changed after review, what you learned.

This option is the highest-value and the highest-risk. It depends on
maintainer bandwidth. Don't pick it without a backup option ready.


## Assessment (for yourself)

Three checks:

1. **`lake build` passes**, no `sorry`, in a fresh clone.
2. **Ten-minute self-walkthrough**: record yourself explaining the
   main theorem, its proof outline, and one design choice you'd
   revisit. Watch it back. Remove filler; fix what's unclear.
3. **The "elevator" test**: in three sentences, what did you prove,
   why does it matter, and what's still missing? Put those three
   sentences in the project README.

If any of the three fails, iterate before claiming completion.


## After the capstone

Possible next steps (not part of this course):
- Mathlib contribution.
- A paper formalization (PLDI / POPL artifact).
- Co-authoring a cslib subfield.
- Teaching this course to someone else — the fastest way to
  consolidate.


## Open questions

- Should we require a public writeup (blog post)? (Leaning: encourage,
  not require. The walkthrough recording covers the reflection
  purpose.)
- Is Option 4 really in scope for a course spec? The repo can't
  guarantee maintainer engagement. (Leaning: keep as an option, flag
  the risk.)
