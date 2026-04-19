import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  defaultLocalState,
  readLocalState,
  writeLocalState,
  recordHintGrant,
  addTranscript,
} from "../src/state.js";

test("defaultLocalState is empty", () => {
  const s = defaultLocalState();
  assert.equal(s.schemaVersion, 1);
  assert.deepEqual(s.hintGrants, []);
});

test("write/read localState roundtrips", async () => {
  const dir = await mkdtemp(resolve(tmpdir(), "fmcourse-state-"));
  try {
    const path = resolve(dir, "state.json");
    let s = defaultLocalState();
    s = recordHintGrant(s, {
      exercise: "Part1/1.1/foo",
      level: 2,
      timestamp: "2026-04-19T00:00:00Z",
      source: "author",
    });
    s = addTranscript(s, {
      kind: "tutor",
      file: "Exercises/Part1/Module1_1.lean",
      startedAt: "2026-04-19T00:00:00Z",
      path: resolve(dir, "transcripts/t.md"),
    });
    await writeLocalState(path, s);
    const read = await readLocalState(path);
    assert.equal(read.hintGrants.length, 1);
    assert.equal(read.transcripts.length, 1);
  } finally {
    await rm(dir, { recursive: true });
  }
});
