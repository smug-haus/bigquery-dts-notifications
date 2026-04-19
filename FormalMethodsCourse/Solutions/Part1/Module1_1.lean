/-!
# Module 1.1 — Reference solutions

This file is the reference answer key. The `fmcourse` CLI's tutor
is NOT allowed to read this file (enforced by the core's context
builder — see `tools/fmcourse/src/context.ts`).

Invocable via: `fmcourse hint --exercise Part1/1.1/<name> --level 4 --reveal`
-/

import FormalMethodsCourse.Part1.Module1_1

open FormalMethodsCourse.Part1.Module1_1
open FormalMethodsCourse.Part1.Module1_1.Set
open FormalMethodsCourse.Part1.Module1_1.Set.Rel

namespace FormalMethodsCourse.Solutions.Part1.Module1_1

variable {α β γ : Type u}

theorem subset_antisymm {s t : Set α}
    (hst : Subset s t) (hts : Subset t s) :
    ∀ a, a ∈ s ↔ a ∈ t := by
  intro a
  exact ⟨hst a, hts a⟩

theorem inter_comm (s t : Set α) :
    Subset (inter s t) (inter t s) := by
  intro a ⟨hs, ht⟩
  exact ⟨ht, hs⟩

theorem union_compl_univ (s : Set α) :
    Subset (union s (compl s)) univ := by
  intro a _
  trivial

theorem surjective_comp {f : α → β} {g : β → γ}
    (hf : Surjective f) (hg : Surjective g) :
    Surjective (fun a => g (f a)) := by
  intro c
  obtain ⟨b, hb⟩ := hg c
  obtain ⟨a, ha⟩ := hf b
  exact ⟨a, by simp [ha, hb]⟩

theorem image_id_subset (s : Set α) :
    Subset (image (fun x => x) s) s := by
  intro b ⟨a, ha, heq⟩
  exact heq ▸ ha

theorem rel_subset_reflTrans (r : Rel α) :
    ∀ a b, r a b → ReflTransClosure r a b := by
  intro a b hab
  exact ReflTransClosure.tail (ReflTransClosure.refl a) hab

theorem reflTrans_idempotent (r : Rel α) :
    ∀ a b, ReflTransClosure (ReflTransClosure r) a b →
           ReflTransClosure r a b := by
  intro a b h
  induction h with
  | refl a => exact ReflTransClosure.refl a
  | tail _ hstep ih => exact reflTransClosure_trans r ih hstep

end FormalMethodsCourse.Solutions.Part1.Module1_1
