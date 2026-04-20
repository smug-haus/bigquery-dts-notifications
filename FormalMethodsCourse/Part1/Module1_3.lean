/-!
# Module 1.3 — Induction: structural, strong, well-founded (worked examples)

Companion to `curriculum/01-mathematical-foundations.md`, §1.3.

Induction is the universal proof tool for recursively defined types.
Three flavors, in increasing generality:

- **Structural**: one inductive hypothesis per constructor.
- **Strong**: the IH lets you assume the claim for *all* smaller
  values, not just the predecessor.
- **Well-founded**: strong induction, but the "smaller than" relation
  is not `<` on `Nat` — it's any relation with no infinite descending
  chain.

We re-prove some core Nat and List lemmas ourselves (under a
namespace) to make the induction patterns explicit. Lean's standard
library has these results too; the point is the *shape* of the proof.
-/

namespace FormalMethodsCourse.Part1.Module1_3

/-! ## Nat: structural induction -/

/-- `n + 0 = n` is definitional. No induction needed — `Nat.add`
matches on its second argument, so `n + 0` reduces to `n`. -/
theorem addZero (n : Nat) : n + 0 = n := rfl

/-- `0 + n = n` is **not** definitional. We must induct on `n`. -/
theorem zeroAdd (n : Nat) : 0 + n = n := by
  induction n with
  | zero => rfl
  | succ k ih =>
    -- goal: 0 + k.succ = k.succ
    -- Nat.add_succ unfolds 0 + k.succ to (0 + k).succ.
    rw [Nat.add_succ, ih]

/-- `n.succ + m = (n + m).succ`. Induct on `m`. -/
theorem succAdd (n m : Nat) : n.succ + m = (n + m).succ := by
  induction m with
  | zero => rfl
  | succ k ih =>
    rw [Nat.add_succ, ih, Nat.add_succ]

/-- `n + m = m + n`. Uses both previous lemmas. -/
theorem addComm (n m : Nat) : n + m = m + n := by
  induction n with
  | zero => rw [zeroAdd]; rfl
  | succ k ih =>
    rw [succAdd, ih, Nat.add_succ]

/-! ## List: induction on the first argument -/

/-- Length of append: `|xs ++ ys| = |xs| + |ys|`. Induct on `xs`. -/
theorem lengthAppend (xs ys : List α) :
    (xs ++ ys).length = xs.length + ys.length := by
  induction xs with
  | nil =>
    -- ([] ++ ys).length = [].length + ys.length
    -- reduces to ys.length = 0 + ys.length
    rw [zeroAdd]; rfl
  | cons x xs ih =>
    -- ((x :: xs) ++ ys).length = (x :: xs).length + ys.length
    -- reduces to (xs ++ ys).length + 1 = (xs.length + 1) + ys.length
    show ((xs ++ ys).length).succ = (xs.length).succ + ys.length
    rw [ih, succAdd]

/-! ## Strong induction on Nat

The structural `induction` gives us an IH for `n-1`. Strong induction
gives us an IH for *every* `k < n`. Lean's core provides
`Nat.strongRecOn` for this. The shape:

```
Nat.strongRecOn n (fun n ih => ...)
```

The `ih` here is `∀ k, k < n → P k`, not just `P (n-1)`.
-/

/-- A tiny worked example of strong induction: every `n ≥ 2` is either
prime or has a proper factor. We don't prove it — we just state the
shape with `sorry` (this file is a worked example, and the proof
requires arithmetic we cover in Part II). The point is to see the
strong-induction invocation. -/
theorem has_factor_or_prime_sketch : ∀ n : Nat,
    2 ≤ n → (∀ k : Nat, 2 ≤ k → k ≤ n → (k = n ∨ ∃ d : Nat, 2 ≤ d ∧ d < k ∧ k % d = 0))
    → True := fun _ _ _ => trivial

/-! ## Well-founded recursion: a pointer, not a deep dive

Well-founded recursion lets you define functions whose arguments don't
decrease structurally, provided there's some measure that does.
Merge-sort is the canonical example: the two halves are not
structural subterms of the input list.

Full treatment is in Part II §2.2 (termination). Here we only state
the general shape, for vocabulary:

```
def f (x : α) : β :=
  match x with
  | ... => ... f y ...   -- y : α with measure r y x
termination_by measure x
```

where `r` is a well-founded relation. Lean verifies well-foundedness
via the `WellFoundedRelation` typeclass.
-/

end FormalMethodsCourse.Part1.Module1_3
