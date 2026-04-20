/-!
# Module 1.3 — Reference solutions

The tutor is NOT allowed to read this file.
-/

import FormalMethodsCourse.Part1.Module1_3

open FormalMethodsCourse.Part1.Module1_3

namespace FormalMethodsCourse.Solutions.Part1.Module1_3

theorem addAssoc (n m k : Nat) : (n + m) + k = n + (m + k) := by
  induction k with
  | zero => rfl
  | succ j ih => rw [Nat.add_succ, Nat.add_succ, Nat.add_succ, ih]

theorem mulZero (n : Nat) : n * 0 = 0 := rfl

theorem zeroMul (n : Nat) : 0 * n = 0 := by
  induction n with
  | zero => rfl
  | succ k ih => rw [Nat.mul_succ, ih]

theorem addSucc (n m : Nat) : n + m.succ = (n + m).succ := rfl

theorem lengthReverse (xs : List α) : xs.reverse.length = xs.length := by
  induction xs with
  | nil => rfl
  | cons x xs ih =>
    rw [List.reverse_cons, lengthAppend, ih]
    rfl

theorem nilAppend (xs : List α) : [] ++ xs = xs := rfl

theorem appendNil (xs : List α) : xs ++ [] = xs := by
  induction xs with
  | nil => rfl
  | cons x xs ih => show x :: (xs ++ []) = x :: xs; rw [ih]

end FormalMethodsCourse.Solutions.Part1.Module1_3
