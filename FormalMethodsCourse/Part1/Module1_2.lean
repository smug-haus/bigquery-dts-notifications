/-!
# Module 1.2 — Propositional and predicate logic (worked examples)

Companion to `curriculum/01-mathematical-foundations.md`, §1.2.

Lean's tactics mirror natural-deduction rules. This module connects the
paper-proof rules you saw in the reading to their Lean counterparts.

| Natural-deduction rule | Lean tactic / term        |
|------------------------|---------------------------|
| `→I`                   | `intro` / `fun h => _`    |
| `→E`  (modus ponens)   | `apply f` / `exact f h`   |
| `∧I`                   | `constructor` / `⟨_, _⟩`  |
| `∧E`                   | `.1`, `.2` / `obtain ⟨a, b⟩ := h` |
| `∨I`                   | `Or.inl`, `Or.inr`        |
| `∨E`                   | `cases h with ...`        |
| `¬I`                   | `intro h` (with goal `False`) |
| `¬E`                   | `exact h₁ h₂` / `absurd`  |
| `∀I`                   | `intro x`                 |
| `∀E`                   | `h x` (application)       |
| `∃I`                   | `⟨witness, proof⟩`        |
| `∃E`                   | `obtain ⟨x, hx⟩ := h`     |

We work **constructively** throughout. Classical logic is flagged
loudly when used (see §1.5).
-/

namespace FormalMethodsCourse.Part1.Module1_2

variable (P Q R : Prop)

/-! ## Propositional fragment -/

/-- Worked example: `∧` is commutative. Direct tactic-mode proof. -/
theorem and_comm' : P ∧ Q → Q ∧ P := by
  intro ⟨hp, hq⟩
  exact ⟨hq, hp⟩

/-- The same proof, in term mode. Illustrates the propositions-as-types
correspondence: a proof of `A ∧ B` is a pair. -/
theorem and_comm'_term : P ∧ Q → Q ∧ P :=
  fun ⟨hp, hq⟩ => ⟨hq, hp⟩

/-- Modus ponens, as a lemma. In paper proofs this is "→E". -/
theorem modus_ponens : (P → Q) → P → Q := by
  intro hpq hp
  exact hpq hp

/-- Contrapositive, constructive direction. -/
theorem contrapositive : (P → Q) → ¬Q → ¬P := by
  intro hpq hnq hp
  exact hnq (hpq hp)

/-- Curry / uncurry — the isomorphism between
`(P ∧ Q) → R` and `P → Q → R`. Both directions constructive. -/
theorem curry_dir : ((P ∧ Q) → R) → (P → Q → R) := by
  intro h p q
  exact h ⟨p, q⟩

theorem uncurry_dir : (P → Q → R) → ((P ∧ Q) → R) := by
  intro h ⟨p, q⟩
  exact h p q

/-- One direction of De Morgan. The other direction
(`¬(P ∧ Q) → ¬P ∨ ¬Q`) is classical; see §1.5. -/
theorem demorgan_forward : ¬P ∨ ¬Q → ¬(P ∧ Q) := by
  intro h ⟨hp, hq⟩
  cases h with
  | inl hnp => exact hnp hp
  | inr hnq => exact hnq hq

/-- Double negation, constructive direction. The reverse
(`¬¬P → P`) is classical. -/
theorem double_neg_intro : P → ¬¬P := by
  intro hp hnp
  exact hnp hp

/-! ## Predicate fragment -/

variable {α : Type u} (A : α → Prop) (B : α → α → Prop)

/-- Universal generalization: introduce the bound variable, then prove
the body for it.

The distribution law `(∀ x, A x ∧ P) ↔ (∀ x, A x) ∧ P` holds only when
`α` is inhabited (otherwise the left side is vacuously true but we
can't extract `P` from it). We state the restricted version. -/
theorem forall_and_distrib [Nonempty α] :
    (∀ x, A x ∧ P) ↔ (∀ x, A x) ∧ P := by
  constructor
  · intro h
    let x := Classical.ofNonempty (α := α)
    exact ⟨fun y => (h y).1, (h x).2⟩
  · intro ⟨hA, hp⟩ x
    exact ⟨hA x, hp⟩

/-- Swapping `∃` past `∀`: the valid direction. The converse is not
derivable in classical logic either (see §1.2 reading). -/
theorem exists_forall_swap :
    (∃ x, ∀ y, B x y) → (∀ y, ∃ x, B x y) := by
  intro ⟨x, h⟩ y
  exact ⟨x, h y⟩

/-- Existential congruence under implication of the body. -/
theorem exists_mono (h : ∀ x, A x → B x x) :
    (∃ x, A x) → (∃ x, B x x) := by
  intro ⟨x, hx⟩
  exact ⟨x, h x hx⟩

/-- `∀` is preserved by bi-implication of the body. -/
theorem forall_iff_congr (A B : α → Prop) (h : ∀ x, A x ↔ B x) :
    (∀ x, A x) ↔ (∀ x, B x) := by
  constructor
  · intro hA x; exact (h x).mp (hA x)
  · intro hB x; exact (h x).mpr (hB x)

end FormalMethodsCourse.Part1.Module1_2
