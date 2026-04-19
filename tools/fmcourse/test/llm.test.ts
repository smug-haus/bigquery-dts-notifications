import { test } from "node:test";
import assert from "node:assert/strict";
import { stuckPlaybook, offlineClient } from "../src/llm.js";

test("stuckPlaybook recognizes universal quantifier", () => {
  const out = stuckPlaybook("goal: ∀ n, n + 0 = n");
  assert.match(out, /intro/);
});

test("stuckPlaybook recognizes existentials", () => {
  const out = stuckPlaybook("goal: ∃ x, P x");
  assert.match(out, /witness|use/);
});

test("stuckPlaybook recognizes disjunction", () => {
  const out = stuckPlaybook("goal: P ∨ Q");
  assert.match(out, /Or\.inl|commit/);
});

test("stuckPlaybook has fallback for empty goals", () => {
  const out = stuckPlaybook("");
  assert.match(out, /ANTHROPIC_API_KEY|simp|exact\?/);
});

test("offlineClient reports offline=true", async () => {
  const c = offlineClient();
  assert.equal(c.offline, true);
  const out = await c.complete({
    system: "",
    messages: [{ role: "user", content: "induction time" }],
  });
  assert.match(out, /induction|Offline|ANTHROPIC_API_KEY/);
});
