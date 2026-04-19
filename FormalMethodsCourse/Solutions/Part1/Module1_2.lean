/-!
# Module 1.2 — Reference solutions

The tutor is NOT allowed to read this file (see
`tools/fmcourse/src/context.ts` — `assertNotSolution`).
-/

import FormalMethodsCourse.Part1.Module1_2

namespace FormalMethodsCourse.Solutions.Part1.Module1_2

variable (P Q R : Prop)
variable {α : Type u} (A B : α → Prop)

theorem or_commut : P ∨ Q → Q ∨ P := by
  intro h
  cases h with
  | inl hp => exact Or.inr hp
  | inr hq => exact Or.inl hq

theorem and_assoc_fwd : (P ∧ Q) ∧ R → P ∧ (Q ∧ R) := by
  intro ⟨⟨hp, hq⟩, hr⟩
  exact ⟨hp, hq, hr⟩

theorem or_assoc_fwd : (P ∨ Q) ∨ R → P ∨ (Q ∨ R) := by
  intro h
  cases h with
  | inl hpq =>
    cases hpq with
    | inl hp => exact Or.inl hp
    | inr hq => exact Or.inr (Or.inl hq)
  | inr hr => exact Or.inr (Or.inr hr)

theorem impl_distrib_and : (P → Q ∧ R) → (P → Q) ∧ (P → R) := by
  intro h
  exact ⟨fun p => (h p).1, fun p => (h p).2⟩

theorem and_iff_elim : (P ∧ Q ↔ R) → (P → Q → R) := by
  intro h p q
  exact h.mp ⟨p, q⟩

theorem demorgan_or_fwd : ¬(P ∨ Q) → ¬P ∧ ¬Q := by
  intro h
  exact ⟨fun p => h (Or.inl p), fun q => h (Or.inr q)⟩

theorem exists_or_distrib :
    (∃ x, A x ∨ B x) → (∃ x, A x) ∨ (∃ x, B x) := by
  intro ⟨x, h⟩
  cases h with
  | inl ha => exact Or.inl ⟨x, ha⟩
  | inr hb => exact Or.inr ⟨x, hb⟩

theorem forall_and : (∀ x, A x ∧ B x) ↔ (∀ x, A x) ∧ (∀ x, B x) := by
  constructor
  · intro h
    exact ⟨fun x => (h x).1, fun x => (h x).2⟩
  · intro ⟨hA, hB⟩ x
    exact ⟨hA x, hB x⟩

theorem exists_implies_all_implies :
    (∃ x, A x) → ((∀ x, A x → P) → P) := by
  intro ⟨x, hx⟩ f
  exact f x hx

end FormalMethodsCourse.Solutions.Part1.Module1_2
