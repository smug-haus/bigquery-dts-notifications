# Part IV — cslib Deep Dives

Goal: the learner can open any file in cslib, follow the development,
explain why the authors made the choices they did, and formalize a new
small result in the same style.

Estimated time: 60–100 hours depending on tracks chosen.

Part IV adds `cslib` to the Lean project as a dependency (see SPEC
§7.2). Exercises now import cslib directly.


## Tracks

The learner picks **at least two** tracks to go deep on and **skims**
the other two. The "skim" deliverable is a 500-word summary of the
track's design, not exercises.


### Track A — λ-calculus in cslib

**Prerequisites.** Part III §3.1–3.5.

**What's in cslib.** Untyped λ-calculus, simply-typed λ-calculus,
System F (and likely more). Operational semantics, reduction
strategies, confluence and normalization results.

**Modules.**

A.1  Tour of cslib's λ-calculus directory. Read the file that defines
     the base syntax. Identify the binding representation; compare to
     your Part III choice.

A.2  Re-prove, using cslib's definitions, **one** of:
     - Confluence of β-reduction (Church–Rosser).
     - Subject reduction for STLC as cslib states it.
     - Progress for STLC as cslib states it.

A.3  **Interface exercise.** Write a small "glue" file that exposes
     cslib's STLC to a client language of your design — for example, a
     syntactic sugar layer that elaborates to cslib terms.

**Deliverable.** One cslib-imported proof + the glue file + a written
comparison of your Part III STLC and cslib's.

---

### Track B — Concurrency theory

**Prerequisites.** Part III §§3.2, 3.6.

**What's in cslib.** CCS and/or π-calculus fragments; labelled
transition systems; bisimulation and structural congruence.

**Modules.**

B.1  Tour of cslib's concurrency directory. Identify the LTS
     abstraction; compare to the one you wrote in §3.6.

B.2  Pick **one**:
     - Prove structural congruence respects reduction for a tiny π
       fragment.
     - Prove strong bisimilarity is a congruence for CCS prefix,
       choice, and parallel composition.

B.3  **Modelling exercise.** Encode a two-process mutex protocol
     (Peterson or a simpler one) in the cslib concurrency vocabulary
     and state a safety property as a bisimulation-friendly goal.
     Proving the property is a stretch goal.

**Deliverable.** One proof + the modelled protocol + written design
notes.

---

### Track C — Algorithms with correctness and complexity

**Prerequisites.** Part II fully; Part III §§3.1–3.3 helpful.

**What's in cslib.** Algorithms + data structures with formal
correctness *and* complexity bounds. This is the track where cost
models live.

**Modules.**

C.1  Tour of the algorithms directory. Identify cslib's convention for
     attaching a running-time bound to a function — cost monad,
     explicit step counting, or a separate recurrence.

C.2  Pick **one**:
     - Formalize merge-sort correctness and a `O(n log n)` comparison
       bound in cslib's style.
     - Formalize binary-search correctness and a `O(log n)` bound.
     - Formalize BFS on a finite graph and prove it finds shortest
       paths.

C.3  **Extension.** Take an existing cslib algorithm file and add a
     new correctness lemma that isn't there yet (e.g., "merge-sort is
     stable"). File a mental PR: write it as if you'd submit it.

**Deliverable.** One algorithm + one extension lemma + a short note
comparing cslib's cost modelling to a textbook's informal analysis.

---

### Track D — Turing machines and decidability

**Prerequisites.** Part I §1.5; Part II fully.

**What's in cslib.** Turing machines, encodings, halting,
decidability results.

**Modules.**

D.1  Tour of cslib's computability directory. Read the TM definition;
     note the tape representation and step function.

D.2  Pick **one**:
     - Encode a small decidable predicate as a TM and prove it
       decides.
     - Prove a closure property: the decidable languages are closed
       under union.
     - State (not necessarily prove) the halting problem is
       undecidable in cslib's framework; identify the key
       diagonalization step.

D.3  **Bridging exercise.** Relate cslib's TM model to a lambda
     calculus you know from Track A (if chosen): state
     Turing-completeness of the untyped λ-calculus as a theorem you
     could hope to prove, and sketch the encoding at a blackboard
     level.

**Deliverable.** One proof + the bridging write-up.


## Part IV gate

- Pick two tracks; complete their exercises end-to-end with
  `lake build` clean.
- For the two skipped tracks, write a 500-word summary of the design
  choices cslib made, as if explaining to a new learner.
- `PROGRESS.md` records which tracks were chosen and why.


## Open questions

- Cslib is actively developed; track names and file paths will drift.
  At v1.0, this file gets pinned to a specific cslib commit and
  updated in a follow-up.
- Should Track D include undecidability proofs as a required path, or
  only as optional? (Leaning: optional. Undecidability formalizations
  are a known time-sink.)
- Is two tracks enough, or should we require three? (Leaning: two,
  because capstone is the breadth check.)
