import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFlags } from "../src/util.js";

test("parseFlags handles --key value", () => {
  const { flags, positional } = parseFlags(["a", "--level", "2"]);
  assert.equal(flags.level, "2");
  assert.deepEqual(positional, ["a"]);
});

test("parseFlags handles --key=value", () => {
  const { flags } = parseFlags(["--exercise=Part1/1.1/foo"]);
  assert.equal(flags.exercise, "Part1/1.1/foo");
});

test("parseFlags handles boolean flags", () => {
  const { flags } = parseFlags(["--reveal"]);
  assert.equal(flags.reveal, true);
});

test("parseFlags groups positionals", () => {
  const { positional, flags } = parseFlags([
    "tutor",
    "Exercises/Part1/Module1_1.lean",
    "--question",
    "what is intro?",
  ]);
  assert.deepEqual(positional, ["tutor", "Exercises/Part1/Module1_1.lean"]);
  assert.equal(flags.question, "what is intro?");
});
