# Module 00 — Pre-flight Diagnostic

Purpose: calibrate starting point. Route past modules you already know;
flag modules you'll need to spend extra time on.

The diagnostic is **not** a test. No score is recorded. Honesty here
saves months later.

## How to use

For each question below, answer one of: **yes / partially / no**.
"Partially" means you could get started but would need a reference
open.

## Questions

### Logic and proof

1. Can you write a natural-deduction proof of
   `(P → Q → R) ↔ (P ∧ Q → R)` from memory?
2. Do you know, without looking it up, what the difference between
   `¬¬P → P` and `P ∨ ¬P` is in constructive logic?
3. Have you written a proof by strong induction on natural numbers?

### Sets, relations, functions

4. Can you define "equivalence relation" and "partial order" precisely,
   including the adjectives that distinguish them?
5. Do you know what a fixed point of a monotone function on a complete
   lattice is, and why one exists?

### Programming / types

6. Can you write a tail-recursive `List.reverse` and argue it
   terminates?
7. Are you comfortable with Hindley–Milner polymorphism
   (`forall a. a -> a`)?
8. Have you used GADTs, or dependent types in any language (Idris,
   Agda, Coq, Lean, or a dependent-types paper)?

### Lean specifically

9. Have you installed Lean 4 via elan before?
10. Can you state what `Prop` is, and how it differs from `Type`?
11. Have you used `rw`, `simp`, or `induction` as tactics?

### CS theory

12. Can you state the Church–Turing thesis in your own words?
13. Do you know what β-reduction is in the λ-calculus?
14. Have you read anything about operational semantics (big-step or
    small-step)?

## Routing

| Answers                                   | Recommendation                                     |
|-------------------------------------------|----------------------------------------------------|
| Mostly "no" in Logic / Sets               | Do Part I in full, slowly.                         |
| Mostly "yes" in Logic / Sets              | Skim Part I, do only exercises; spend time on §1.4 and §1.6 anyway. |
| Mostly "no" on Lean                       | Do Part II in full. Do not skip §2.5.              |
| "Yes" on Lean + "partially" on dependent types | Skim Part II; land hard on §2.6–2.8.         |
| "Yes" on CS theory questions              | Accelerate Part III; choose a Part IV track you do *not* already know. |
| "Yes" across the board                    | Go straight to Part IV and capstone. Re-read SPEC §6 first. |

## Open questions for the author

Resolved here as they're decided:

- Should diagnostic questions map 1:1 to module sections? (TBD)
- Should answers self-grade to a JSON so tooling can unlock modules?
  (Leaning: no. Over-engineered for N=1.)
