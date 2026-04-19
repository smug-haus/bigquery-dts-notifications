# Part II — Lean 4 as a Proof Assistant

Goal: the learner leaves this part writing idiomatic Lean 4 — tactic
proofs, term-mode proofs, inductive definitions, and class-based
abstractions — and able to navigate Mathlib.

Estimated time: 50–70 hours.

This is where the bulk of active exercise time lives. Every module
ends in working Lean code, not just prose.


## Modules

### 2.1 Setup: Lake, elan, toolchain, editor

**Content.**
- `elan` for toolchain management; why pin a toolchain.
- `lake new`, `lake build`, `lake exe`; reading `lakefile.toml`.
- The Lean language server; VS Code extension; alternatives.
- The InfoView: expected type, goal state, term elaboration.
- `#check`, `#eval`, `#print`, `#reduce`, `#explode`.

**Deliverable.** A working `FormalMethodsCourse` project with a
minimal `lakefile.toml` that will later depend on cslib.

---

### 2.2 Functions, definitions, pattern matching, recursion

**Content.**
- `def`, `abbrev`, `example`.
- Pattern matching, `match`, `fun` with patterns.
- Structural recursion; the termination checker at a high level.
- `partial def`, `opaque`, and when to use them (almost never).
- Anonymous constructors, named fields, dot notation.

**Exercises.**
- Implement `List.reverse` twice: naive O(n²) and accumulator-style
  O(n). Prove they're extensionally equal (proof deferred to §2.5).
- Implement `Tree.depth`, `Tree.size`, `Tree.mirror`.
- Write `Nat.fib` and convince Lean it terminates.

---

### 2.3 Inductive types

**Content.**
- `inductive` syntax; constructors.
- `Nat`, `List α`, `Option α`, `Sum α β`, `Prod α β` from first
  principles.
- Indexed families: `Vec α n`, `Fin n`.
- The auto-generated recursor and `cases`/`rcases`.
- Coinductive intuition, deferred to Part III.

**Exercises.**
- Define `BTree α` and `RoseTree α`.
- Define `Vec` and implement `Vec.head`, `Vec.tail`, `Vec.append`.
- Define syntax trees for a tiny arithmetic expression language.

---

### 2.4 Propositions as types; term mode

**Content.**
- `Prop` vs. `Type`; proof irrelevance.
- `fun`, `have`, `show`, `let` in proofs.
- `And.intro`, `Or.inl`, `Or.inr`; projections.
- `Exists.intro`, `Exists.elim`.
- When term-mode beats tactic-mode for readability.

**Exercises.**
- In term mode, prove `P ∧ Q → Q ∧ P`.
- In term mode, prove `(P → Q) → (P → R) → P → Q ∧ R`.
- In term mode, prove `∃x. P x → ∃x. P x ∨ Q x`.

---

### 2.5 Tactics — the core toolkit

**Content.**
- Structural: `intro`, `intros`, `revert`, `clear`, `rename_i`.
- Introduction: `exact`, `refine`, `apply`, `constructor`, `use`,
  `exists`.
- Elimination: `cases`, `rcases`, `obtain`, `induction`.
- Equality: `rfl`, `rw`, `simp`, `simp only`, `calc`.
- Decision procedures: `decide`, `omega`, `linarith`, `norm_num`.
- Bookkeeping: `have`, `show`, `change`, `suffices`.
- Reading goal states fluently.

**Exercises.**
- All the term-mode proofs from §2.4, redone in tactic mode.
- Prove `List.append_assoc` by induction on the first list.
- Prove `List.length_append`.
- Prove the two `List.reverse` implementations from §2.2 are equal.

---

### 2.6 Dependent types and the universe hierarchy

**Content.**
- `Π` and `Σ` types in Lean syntax.
- `Vec α n` appends of matching length.
- `Type u` and universe polymorphism; `universe u`.
- Why `Prop : Type`, `Type u : Type (u+1)`.
- Subsingleton, propositional equality, `Eq.rec` at a glance.

**Exercises.**
- Write `Vec.replicate : (n : Nat) → α → Vec α n`.
- Prove `Vec.append_assoc` (harder than `List.append_assoc` — the
  indices get in the way).
- State and prove: the type of non-empty lists is equivalent to
  `Σ α, List α`… discuss why equivalence ≠ equality.

---

### 2.7 Type classes

**Content.**
- `class`, `instance`, `[Inst : Foo α]`.
- Default instances; priority.
- `Decidable`, `DecidableEq`, `Inhabited`, `Repr`, `ToString`.
- `Functor`, `Applicative`, `Monad` — with `Option` and `List` as
  instances.
- `Monad` laws; `do` notation.

**Exercises.**
- Implement `Functor`, `Applicative`, `Monad` for your own `Option`
  and prove the laws.
- Write `DecidableEq` for a custom inductive type.
- Use `Decidable` to implement a `Bool`-returning membership check on
  a list of a type with `DecidableEq`.

---

### 2.8 Structures and algebraic hierarchy

**Content.**
- `structure` vs. `class`.
- Extending structures; old-style vs. new-style inheritance.
- Mathlib's algebraic hierarchy at a glance: `Preorder`,
  `PartialOrder`, `Monoid`, `Group`, `Lattice`.
- How `instance` resolution walks the hierarchy.

**Exercises.**
- Define `Semigroup` and `Monoid` from scratch; prove that `Monoid`
  operations are associative via unfolding.
- Give a `Preorder` instance for divisibility on `Nat`.
- Read three Mathlib files that define hierarchy structures; write a
  one-paragraph summary of what surprised you.

---

### 2.9 Navigating Mathlib

**Content.**
- Naming conventions (`Nat.add_comm`, `List.length_append`, etc.).
- `exact?`, `apply?`, `rw?`, `search`.
- `loogle` / `leansearch` usage.
- Reading `Mathlib/Order/` and `Mathlib/Algebra/` as reference.
- When to import what; avoiding `import Mathlib` in leaf files.

**Exercises.**
- Find, using only search tactics, the Mathlib lemma for
  `a + b = b + a` on any commutative monoid.
- Prove `∀ n : ℕ, n * (n + 1) / 2 = (Finset.range (n+1)).sum id`
  using existing Mathlib machinery.

---

### 2.10 Metaprogramming preview

**Content.**
- `macro`, `syntax`, `elab` at a surface level.
- Writing a trivial custom tactic: `my_rfl`.
- `MetaM`, `TacticM`, `TermElabM` — name-level introduction only.
- When *not* to reach for metaprogramming.

**Exercises.**
- Write a macro `triv` that tries `rfl`, then `decide`, then
  `simp`.
- Write a tactic `split_ands` that repeatedly applies
  `And.intro`.

This module is a **preview**, not mastery. The learner shouldn't feel
bad closing the tab on §2.10 with 60% understanding.


## Gate for Part II

- The `FormalMethodsCourse` Lean project builds clean.
- All `Exercises/Part2/*.lean` compile with no `sorry`.
- Concept checks answered in `PROGRESS.md`.

Once Part II gates, Part III unlocks.


## Open questions

- Should §2.10 be moved to an appendix? (Leaning: keep it here;
  metaprogramming is essential cultural literacy for Lean.)
- Is §2.8's algebraic-hierarchy tour wasted if we never use groups?
  (Leaning: no. Reading fluency matters more than use.)
