/-!
# Module 1.3 — Exercises

All of these yield to structural induction. When a proof gets stuck,
check: did you induct on the right variable? (Addition in Lean is
recursive on its *second* argument, so inducting on the first often
leaves you without a reduction.)

Ask for help with `fmcourse hint --exercise Part1/1.3/<name>`.
-/

import FormalMethodsCourse.Part1.Module1_3

open FormalMethodsCourse.Part1.Module1_3

namespace Exercises.Part1.Module1_3

/-- Exercise 1.3.1: addition is associative. Induct on the last
variable. -/
theorem addAssoc (n m k : Nat) : (n + m) + k = n + (m + k) := by
  sorry

/-- Exercise 1.3.2: `n * 0 = 0` — definitional. No induction needed. -/
theorem mulZero (n : Nat) : n * 0 = 0 := by
  sorry

/-- Exercise 1.3.3: `0 * n = 0`. Induct on `n` (mirror of `zeroAdd`). -/
theorem zeroMul (n : Nat) : 0 * n = 0 := by
  sorry

/-- Exercise 1.3.4: `n + m.succ = (n + m).succ`. Unlike `succAdd`, no
induction needed — this is definitional. -/
theorem addSucc (n m : Nat) : n + m.succ = (n + m).succ := by
  sorry

/-- Exercise 1.3.5: length of list reversal. Uses `lengthAppend`.

    You may use `List.reverse` from core; it's defined via
    `List.reverseAux`. For this exercise, it's cleaner to induct on
    the list and unfold `List.reverse` using its cons-case lemma
    `List.reverse_cons : (x :: xs).reverse = xs.reverse ++ [x]`. -/
theorem lengthReverse (xs : List α) : xs.reverse.length = xs.length := by
  sorry

/-- Exercise 1.3.6: `[] ++ xs = xs`. Definitional. -/
theorem nilAppend (xs : List α) : [] ++ xs = xs := by
  sorry

/-- Exercise 1.3.7: `xs ++ [] = xs`. **Not** definitional — induct. -/
theorem appendNil (xs : List α) : xs ++ [] = xs := by
  sorry

end Exercises.Part1.Module1_3
