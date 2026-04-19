# Part I — Mathematical Foundations

Goal: the learner leaves this part able to read any definition or
theorem statement in cslib and translate it to plain English without
opening a reference.

Scope is deliberately narrow. We teach what's load-bearing for Lean
and cslib, nothing else.

Estimated time: 40–60 hours.


## Modules

### 1.1 Sets, functions, relations

**Why we need it.** Every inductive type, every semantic relation,
every theorem statement is ultimately a set or a relation. The
vocabulary must be automatic.

**Topics.**
- Sets: membership, subset, union, intersection, powerset,
  characteristic functions.
- Functions: domain, codomain, image, preimage; injective, surjective,
  bijective.
- Relations: reflexive, symmetric, transitive, antisymmetric; closures
  (reflexive, transitive, reflexive-transitive).
- Cartesian products, disjoint unions, indexed families.
- Cardinality, countability (light touch; we need it for diagonalization
  in Part IV).

**Lean preview.** Reading (not writing yet) of `Set α = α → Prop`
from Mathlib; how Lean's `Rel α β = α → β → Prop` relates to a binary
relation on paper.

**Exercises.**
- Pen-and-paper: prove De Morgan's laws for sets.
- Pen-and-paper: prove that the composition of injective functions is
  injective.
- Pen-and-paper: show the reflexive-transitive closure is idempotent.

**Concept checks.**
- In one sentence, distinguish `image` and `preimage`.
- Why is the reflexive-transitive closure of `R` equal to the smallest
  reflexive and transitive relation containing `R`?

---

### 1.2 Propositional and predicate logic; natural deduction

**Why we need it.** Lean's tactics are natural-deduction rules with
better syntax. You won't understand `intro`/`apply` until you've
written a tree proof.

**Topics.**
- Syntax of propositional and first-order logic.
- Semantics: truth tables, Tarski-style structures.
- Natural deduction: introduction/elimination rules for `∧`, `∨`,
  `→`, `¬`, `∀`, `∃`, `=`.
- Sequent-style reading vs. Fitch-style presentation.
- Soundness and completeness **as stated** (no proofs here).

**Exercises.**
- Pen-and-paper: prove `(P → Q) → (¬Q → ¬P)` in natural deduction.
- Pen-and-paper: prove `∀x. P x → ∃x. P x` is derivable *only* if
  the domain is nonempty; explain why.
- Pen-and-paper: show that `∃x. ∀y. R x y → ∀y. ∃x. R x y` but not
  the converse.

**Concept checks.**
- State the elimination rule for `∨` in one line.
- Why doesn't propositional logic alone suffice to express "every
  natural number has a successor"?

---

### 1.3 Induction: structural, strong, well-founded

**Why we need it.** Every nontrivial theorem about a recursive type in
Lean is proved by induction. Three flavors; pick the right one.

**Topics.**
- Structural induction on `Nat`, `List`, binary trees.
- Strong / course-of-values induction on `Nat`.
- Well-founded induction: the general shape; `<` on `Nat` as the
  motivating instance.
- Mutual induction for mutually recursive types.

**Exercises.**
- Pen-and-paper: by induction on `n`, prove
  `∑_{i=0}^{n-1} (2i+1) = n²`.
- Pen-and-paper: by strong induction, prove every natural number > 1
  has a prime factor.
- Pen-and-paper: define a well-founded relation on `List α × List α`
  used in merge-sort's termination argument.

**Concept checks.**
- When does strong induction buy you something structural induction
  doesn't?
- Why does well-founded induction require the relation to have no
  infinite descending chains?

---

### 1.4 Orders, lattices, fixed points

**Why we need it.** Operational and denotational semantics are
defined as least fixed points of monotone operators. Inductive
definitions secretly use Knaster–Tarski.

**Topics.**
- Preorders, partial orders, total orders.
- Lattices: meet, join; complete lattices.
- Monotone functions.
- Knaster–Tarski: every monotone function on a complete lattice has
  a least fixed point.
- Kleene's fixed-point theorem for ω-continuous functions.
- Why "inductively defined" = "least fixed point of the rule operator."

**Exercises.**
- Pen-and-paper: prove the lattice of subsets of a set is complete.
- Pen-and-paper: show the "one-step reduction" operator on a given
  grammar is monotone.
- Pen-and-paper: compute the least fixed point of a small operator on
  `P(ℕ)` by iterating.

**Concept checks.**
- What's the least fixed point characterization of the transitive
  closure?
- Give an example where Knaster–Tarski gives you a fixed point but
  Kleene doesn't reach it in ω steps.

---

### 1.5 Constructive vs. classical logic

**Why we need it.** Lean's `Prop` is constructive by default. You
have to know what you're giving up when you reach for `Classical.em`.

**Topics.**
- The BHK (Brouwer–Heyting–Kolmogorov) interpretation.
- Constructive proofs of existence carry witnesses.
- What fails constructively: `¬¬P → P`, `P ∨ ¬P`, `(¬∀x. P x) → ∃x. ¬P x`.
- Decidability: `Decidable P = P ∨ ¬P` for computable `P`.
- Double-negation translation (sketch; name-check Gödel–Gentzen).

**Exercises.**
- Pen-and-paper: derive `¬¬(P ∨ ¬P)` constructively.
- Pen-and-paper: find a statement true classically but not
  constructively, and explain the missing witness.
- Pen-and-paper: show that `P → ¬¬P` is constructive.

**Concept checks.**
- Why can't you do case analysis on `P ∨ ¬P` in Lean without invoking
  classical reasoning for non-`Decidable P`?
- What's the connection between constructive existence and extracting
  a program?

---

### 1.6 Type theory, intuitively

**Why we need it.** Lean 4 is built on a dependent type theory. You
don't need to prove normalization, but you need the vocabulary.

**Topics.**
- Simple types; products, sums, function types.
- Dependent types: `Π` (dependent function), `Σ` (dependent pair).
- Universe hierarchy (why we need it; Russell's paradox in one line).
- Propositions-as-types: `A → B` is a function, a proof of
  `A → B` is also a function.
- Identity types and equality (very brief preview; deeper in Part II).
- Named references: Martin-Löf, CoC, CIC, Lean's DTT — without
  deep-diving.

**Exercises.**
- Pen-and-paper: write the type of "a function that takes a natural
  `n` and returns a vector of length `n`."
- Pen-and-paper: exhibit a term of type `Π (A : Type), A → A`.
- Pen-and-paper: under BHK, what program corresponds to a proof of
  `∀n:ℕ. ∃m:ℕ. m > n`?

**Concept checks.**
- Why must Lean have a universe hierarchy rather than `Type : Type`?
- State propositions-as-types for `∧` and `∨`.


## Gate for Part I

- All pen-and-paper exercises checked against a reference solution
  (to be written under `FormalMethodsCourse/Part1/Solutions/`).
- Lean scaffolds (minimal, about 15 `sorry`s across modules) fill in.
- Concept-check answers written in `PROGRESS.md` in your own words.

Once Part I's Lean exercises compile, Part II unlocks.


## Open questions

- Should 1.2 include a Hilbert-system presentation alongside natural
  deduction? (Leaning: no. Natural deduction maps to Lean cleanly;
  Hilbert doesn't.)
- Is §1.4 too heavy for Part I? Could be split if learners struggle.
