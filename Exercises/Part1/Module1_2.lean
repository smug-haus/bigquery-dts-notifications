/-!
# Module 1.2 — Exercises

Fill in each `sorry`. All proofs below are constructively provable in
Lean (no `Classical.em` needed). If you reach for `by_cases`, stop —
there's a simpler proof.

Ask for help with `fmcourse hint --exercise Part1/1.2/<name>`.
-/

import FormalMethodsCourse.Part1.Module1_2

namespace Exercises.Part1.Module1_2

variable (P Q R : Prop)
variable {α : Type u} (A B : α → Prop)

/-- Exercise 1.2.1: `∨` is commutative. -/
theorem or_commut : P ∨ Q → Q ∨ P := by
  sorry

/-- Exercise 1.2.2: conjunction is associative (one direction). -/
theorem and_assoc_fwd : (P ∧ Q) ∧ R → P ∧ (Q ∧ R) := by
  sorry

/-- Exercise 1.2.3: disjunction is associative (one direction). -/
theorem or_assoc_fwd : (P ∨ Q) ∨ R → P ∨ (Q ∨ R) := by
  sorry

/-- Exercise 1.2.4: `→` distributes over `∧`. -/
theorem impl_distrib_and : (P → Q ∧ R) → (P → Q) ∧ (P → R) := by
  sorry

/-- Exercise 1.2.5: iff-splitting of an exclusive goal. -/
theorem and_iff_elim : (P ∧ Q ↔ R) → (P → Q → R) := by
  sorry

/-- Exercise 1.2.6: the constructive half of De Morgan for `∨`. -/
theorem demorgan_or_fwd : ¬(P ∨ Q) → ¬P ∧ ¬Q := by
  sorry

/-- Exercise 1.2.7: existential commutes with disjunction. -/
theorem exists_or_distrib :
    (∃ x, A x ∨ B x) → (∃ x, A x) ∨ (∃ x, B x) := by
  sorry

/-- Exercise 1.2.8: universal commutes with conjunction. -/
theorem forall_and : (∀ x, A x ∧ B x) ↔ (∀ x, A x) ∧ (∀ x, B x) := by
  sorry

/-- Exercise 1.2.9 (stretch): a "drinker's paradox" lite — valid
constructively because the predicate is decidable on a singleton. We
state a weakened form that *is* constructive. -/
theorem exists_implies_all_implies :
    (∃ x, A x) → ((∀ x, A x → P) → P) := by
  sorry

end Exercises.Part1.Module1_2
