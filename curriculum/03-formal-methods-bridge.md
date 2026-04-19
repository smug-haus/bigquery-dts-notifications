# Part III — Formal Methods Bridge

Goal: the learner leaves this part able to define a small language,
give it operational semantics and a type system, and prove type
soundness — the "hello world" of programming-language theory.

Estimated time: 40–60 hours.

Part III does **not** import cslib. We re-derive these results from
scratch. The point is to build the mental model the library assumes.
When Part IV arrives, the learner will recognize every move cslib
makes.


## Modules

### 3.1 Syntax and binding

**Content.**
- Concrete vs. abstract syntax; BNF notation.
- Variables, binders, α-equivalence — why naming matters.
- Three representations: named, de Bruijn indices, locally nameless.
- Capture-avoiding substitution, the hard way and the easy ways.
- Informal "we work up to α-equivalence" as an honest admission.

**Exercises.**
- Define the untyped λ-calculus with named variables in Lean; define
  β-reduction; observe capture bugs.
- Redefine it with de Bruijn indices; implement `shift` and
  `subst`.
- Prove: de Bruijn substitution preserves closed terms.

**Concept checks.**
- Why is de Bruijn preferred for machine-checked proofs?
- Give an example where named-variable substitution captures and
  explain how locally nameless sidesteps it.

---

### 3.2 Small-step operational semantics

**Content.**
- Reduction as an inductively defined relation.
- Congruence rules vs. head-reduction rules; call-by-value vs.
  call-by-name.
- The multi-step relation (reflexive-transitive closure); from Part I
  §1.4, we know what that means formally.
- Evaluation contexts as a presentation trick.

**Exercises.**
- Define small-step semantics for a tiny arithmetic language (numerals
  + plus + times) in Lean.
- Prove deterministic reduction.
- Prove: every non-value expression reduces (progress-shaped lemma).

---

### 3.3 Big-step (natural) semantics

**Content.**
- `⇓` as a relation between expressions and values.
- Equivalence with small-step for a terminating language.
- What big-step hides: nontermination and partiality.

**Exercises.**
- Give a big-step semantics for the language of §3.2.
- Prove it agrees with small-step on terminating programs.
- State (not prove) where the agreement breaks down for a language
  with loops.

---

### 3.4 Simply-typed λ-calculus

**Content.**
- Types: `ι`, `τ → τ`.
- Typing contexts; the `Γ ⊢ e : τ` judgment.
- Progress and preservation; type soundness as their conjunction.
- Weakening and substitution lemmas — necessary infrastructure.
- Why you prove substitution lemma before preservation.

**Exercises.**
- Define STLC in Lean (pick your binding representation from §3.1;
  we suggest de Bruijn).
- Prove weakening.
- Prove the substitution lemma.
- Prove preservation.
- Prove progress.
- State type soundness as a corollary.

This is the core of Part III. Do not move on until these compile.

---

### 3.5 Strong normalization (sketch)

**Content.**
- Why induction on expression size doesn't work for STLC normalization.
- Tait's logical-relations method, at the level of a one-page sketch.
- What the cslib λ-calculus development does differently.
- Confluence, Church–Rosser statement; diamond property.

**Exercises.**
- Prove confluence for β-reduction on a calculator-sized language
  where a direct diamond-property argument works.
- For STLC, write the *statement* of strong normalization in Lean;
  leave as `sorry`. The goal is vocabulary, not proof.

---

### 3.6 Equivalence relations on programs (preview)

**Content.**
- Contextual equivalence as the "right" notion.
- Why it's hard to work with directly.
- Bisimulation (for transition systems); coinduction intuition.
- Logical relations as the usual technical hammer.

**Exercises.**
- Define a labelled transition system over a tiny imperative language.
- Define strong bisimulation as a coinductive relation.
- Prove: bisimulation is an equivalence relation.
- (Stretch) Define weak bisimulation and state the difference.

---

### 3.7 Denotational semantics (preview)

**Content.**
- Values as mathematical objects (sets, functions).
- Why partial functions require domain theory.
- ω-cpos, continuous functions, least fixed points.
- The denotational / operational correspondence at a statement level.

**Exercises.**
- Give a denotational semantics to the language of §3.2 (total, no
  loops — straightforward).
- Read Winskel's chapter on domain theory and write a one-paragraph
  summary of what broke when loops entered the language.

This module is mostly prose. Lean exercises are light.


## Gate for Part III

- STLC type soundness (§3.4) compiles without `sorry`.
- Confluence for the small calculus (§3.5) compiles.
- Concept checks answered for §§3.1–3.4. §§3.5–3.7 are preview;
  concept checks optional.

Once Part III gates, Part IV unlocks.


## Open questions

- Is §3.7 pulling its weight, or does it belong in the capstone path
  only? (Leaning: keep as preview. Many cslib developments cite
  denotational results.)
- Should we use locally nameless instead of de Bruijn? Cslib's choice
  will settle this; spec resolves once cslib's convention is locked.
