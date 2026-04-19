/-!
# Module 1.1 — Exercises

Fill in each `sorry`. When `lake build` succeeds with no `sorry`
anywhere in this file, you have passed the CI gate for this module.

Ask for help with `fmcourse hint --exercise Part1/1.1/<name>` or
`fmcourse tutor Exercises/Part1/Module1_1.lean`.
-/

import FormalMethodsCourse.Part1.Module1_1

open FormalMethodsCourse.Part1.Module1_1
open FormalMethodsCourse.Part1.Module1_1.Set
open FormalMethodsCourse.Part1.Module1_1.Set.Rel

namespace Exercises.Part1.Module1_1

variable {α β γ : Type u}

/-- Exercise 1.1.1: antisymmetry of subset. -/
theorem subset_antisymm {s t : Set α}
    (hst : Subset s t) (hts : Subset t s) :
    ∀ a, a ∈ s ↔ a ∈ t := by
  sorry

/-- Exercise 1.1.2: intersection is commutative up to subset. -/
theorem inter_comm (s t : Set α) :
    Subset (inter s t) (inter t s) := by
  sorry

/-- Exercise 1.1.3: every element of the union of `s` and its
    complement is trivially in the universal set. -/
theorem union_compl_univ (s : Set α) :
    Subset (union s (compl s)) univ := by
  sorry

/-- Exercise 1.1.4: composition of surjective functions is surjective. -/
theorem surjective_comp {f : α → β} {g : β → γ}
    (hf : Surjective f) (hg : Surjective g) :
    Surjective (fun a => g (f a)) := by
  sorry

/-- Exercise 1.1.5: the image of a set under the identity is the set
    itself, in the sense of mutual subset. You'll prove one direction;
    the other is in the solution. -/
theorem image_id_subset (s : Set α) :
    Subset (image (fun x => x) s) s := by
  sorry

/-- Exercise 1.1.6: the reflexive-transitive closure of a relation
    contains the relation itself. -/
theorem rel_subset_reflTrans (r : Rel α) :
    ∀ a b, r a b → ReflTransClosure r a b := by
  sorry

/-- Exercise 1.1.7 (stretch): idempotence of the reflexive-transitive
    closure, one direction. Applying the closure to an already-closed
    relation does not add new pairs.

    Given: `R* := ReflTransClosure r`.
    Goal: for all `a b`, `ReflTransClosure R* a b → R* a b`. -/
theorem reflTrans_idempotent (r : Rel α) :
    ∀ a b, ReflTransClosure (ReflTransClosure r) a b →
           ReflTransClosure r a b := by
  sorry

end Exercises.Part1.Module1_1
