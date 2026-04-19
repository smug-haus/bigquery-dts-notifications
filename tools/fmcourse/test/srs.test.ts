import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCards, sm2 } from "../src/srs.js";
import type { SrsCard } from "../src/state.js";

const SAMPLE = `
# deck

\`\`\`card
id: x1
module: "1.1"
tags: [set, definition]
---
Q: Define Set α in Lean.
A: Set α := α → Prop.
\`\`\`

\`\`\`card
id: x2
module: "1.1"
tags: [function]
---
Q: Define Injective.
A: ∀ {a₁ a₂}, f a₁ = f a₂ → a₁ = a₂.
\`\`\`
`;

function blank(id: string): SrsCard {
  return {
    id,
    module: "1.1",
    front: "f",
    back: "b",
    tags: [],
    interval: 0,
    repetition: 0,
    ease: 2.5,
    dueAt: new Date().toISOString(),
    introduced: true,
  };
}

test("parseCards reads markdown card blocks", () => {
  const cards = parseCards(SAMPLE);
  assert.equal(cards.length, 2);
  assert.equal(cards[0].id, "x1");
  assert.equal(cards[0].front, "Define Set α in Lean.");
  assert.deepEqual(cards[0].tags, ["set", "definition"]);
});

test("sm2 resets on q<3", () => {
  const c = { ...blank("x"), repetition: 3, interval: 15, ease: 2.5 };
  const after = sm2(c, 2);
  assert.equal(after.repetition, 0);
  assert.equal(after.interval, 1);
});

test("sm2 schedules first success at 1 day", () => {
  const after = sm2(blank("x"), 5);
  assert.equal(after.interval, 1);
  assert.equal(after.repetition, 1);
});

test("sm2 schedules second success at 6 days", () => {
  const once = sm2(blank("x"), 5);
  const twice = sm2(once, 5);
  assert.equal(twice.interval, 6);
  assert.equal(twice.repetition, 2);
});

test("sm2 grows interval by ease on third+ success", () => {
  const a = sm2(sm2(sm2(blank("x"), 5), 5), 5);
  assert.ok(a.interval > 6, "expected interval > 6, got " + a.interval);
});

test("sm2 clamps ease at 1.3", () => {
  let c = blank("x");
  for (let i = 0; i < 20; i++) c = sm2(c, 0);
  assert.ok(c.ease >= 1.3, "ease should be >= 1.3, got " + c.ease);
});
