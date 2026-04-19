/-!
# Module 1.1 — Sets, functions, relations (worked examples)

Companion to `curriculum/01-mathematical-foundations.md`, §1.1.

We work from first principles — no Mathlib import. A set is its
membership predicate. This is the same choice cslib and Mathlib make.
-/

namespace FormalMethodsCourse.Part1.Module1_1

/-- A set of `α` is a predicate on `α`. `a ∈ s` is sugar for `s a`. -/
def Set (α : Type u) : Type u := α → Prop

namespace Set

variable {α β : Type u}

instance : Membership α (Set α) := ⟨fun a s => s a⟩

/-- The empty set: no element satisfies it. -/
def empty : Set α := fun _ => False

/-- The full set: every element satisfies it. -/
def univ : Set α := fun _ => True

/-- Subset: every element of `s` is also an element of `t`. -/
def Subset (s t : Set α) : Prop := ∀ a, a ∈ s → a ∈ t

/-- Union. -/
def union (s t : Set α) : Set α := fun a => a ∈ s ∨ a ∈ t

/-- Intersection. -/
def inter (s t : Set α) : Set α := fun a => a ∈ s ∧ a ∈ t

/-- Complement. -/
def compl (s : Set α) : Set α := fun a => ¬ a ∈ s

/-- Image of a set under a function. -/
def image (f : α → β) (s : Set α) : Set β :=
  fun b => ∃ a, a ∈ s ∧ f a = b

/-- Preimage of a set under a function. -/
def preimage (f : α → β) (t : Set β) : Set α :=
  fun a => f a ∈ t

/-! ## Worked example 1: subset is reflexive. -/

theorem subset_refl (s : Set α) : Subset s s := by
  intro a ha
  exact ha

/-! ## Worked example 2: subset is transitive. -/

theorem subset_trans {s t u : Set α}
    (hst : Subset s t) (htu : Subset t u) : Subset s u := by
  intro a ha
  exact htu a (hst a ha)

/-! ## Worked example 3: De Morgan, one direction.

The full De Morgan for union is left as an exercise.
-/

theorem compl_inter_subset (s t : Set α) :
    Subset (compl (inter s t)) (union (compl s) (compl t)) := by
  intro a (ha : ¬ (a ∈ s ∧ a ∈ t))
  -- Classical reasoning would finish in one line; we instead use
  -- constructive case analysis on `Decidable (a ∈ s)`. To keep Part I
  -- truly classical-free, we state the contrapositive shape directly:
  -- from ¬(P ∧ Q) we can derive ¬P ∨ ¬Q only classically. So we use
  -- `Classical.em` here and flag it loudly. See §1.5 for the full
  -- discussion.
  by_cases hs : a ∈ s
  · by_cases ht : a ∈ t
    · exact absurd ⟨hs, ht⟩ ha
    · exact Or.inr ht
  · exact Or.inl hs

/-! ## Functions: injectivity, surjectivity. -/

/-- `f` is injective if equal outputs force equal inputs. -/
def Injective (f : α → β) : Prop :=
  ∀ {a₁ a₂}, f a₁ = f a₂ → a₁ = a₂

/-- `f` is surjective if every codomain element is hit. -/
def Surjective (f : α → β) : Prop :=
  ∀ b, ∃ a, f a = b

/-! ## Worked example 4: composition preserves injectivity. -/

theorem injective_comp {f : α → β} {g : β → γ}
    (hf : Injective f) (hg : Injective g) :
    Injective (fun a => g (f a)) := by
  intro a₁ a₂ h
  exact hf (hg h)

/-! ## Relations and closures. -/

/-- A binary relation on `α` is a `Set (α × α)`, or equivalently a
    curried predicate. We use the curried form — it composes better. -/
def Rel (α : Type u) : Type u := α → α → Prop

namespace Rel

variable {α : Type u}

/-- Reflexivity. -/
def Reflexive (r : Rel α) : Prop := ∀ a, r a a

/-- Transitivity. -/
def Transitive (r : Rel α) : Prop :=
  ∀ {a b c}, r a b → r b c → r a c

/-- The reflexive-transitive closure of `r`. -/
inductive ReflTransClosure (r : Rel α) : Rel α where
  | refl (a : α) : ReflTransClosure r a a
  | tail {a b c : α} : ReflTransClosure r a b → r b c → ReflTransClosure r a c

/-- Worked example: the reflexive-transitive closure is reflexive. -/
theorem reflTransClosure_refl (r : Rel α) :
    Reflexive (ReflTransClosure r) := by
  intro a
  exact ReflTransClosure.refl a

/-- Worked example: the reflexive-transitive closure is transitive.

The proof is by induction on the second hypothesis. -/
theorem reflTransClosure_trans (r : Rel α) :
    Transitive (ReflTransClosure r) := by
  intro a b c hab hbc
  induction hbc with
  | refl _ => exact hab
  | tail _ hstep ih => exact ReflTransClosure.tail ih hstep

end Rel
end Set
end FormalMethodsCourse.Part1.Module1_1
