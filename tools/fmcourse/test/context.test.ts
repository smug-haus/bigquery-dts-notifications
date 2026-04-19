import { test } from "node:test";
import assert from "node:assert/strict";
import { assertNotSolution, detectModuleId } from "../src/context.js";

test("assertNotSolution blocks solutions path", () => {
  assert.throws(
    () =>
      assertNotSolution(
        "/repo/FormalMethodsCourse/Solutions/Part1/Module1_1.lean",
      ),
    /refused to read solution/,
  );
});

test("assertNotSolution allows non-solution paths", () => {
  assert.doesNotThrow(() =>
    assertNotSolution("/repo/Exercises/Part1/Module1_1.lean"),
  );
  assert.doesNotThrow(() =>
    assertNotSolution("/repo/FormalMethodsCourse/Part1/Module1_1.lean"),
  );
});

test("detectModuleId parses Module1_1.lean", () => {
  assert.equal(
    detectModuleId("Exercises/Part1/Module1_1.lean"),
    "1.1",
  );
});

test("detectModuleId handles multi-digit parts", () => {
  assert.equal(
    detectModuleId("Exercises/Part2/Module2_10.lean"),
    "2.10",
  );
});

test("detectModuleId returns null on unrelated paths", () => {
  assert.equal(detectModuleId("curriculum/00-diagnostic.md"), null);
});
