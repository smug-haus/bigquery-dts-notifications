import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  defaultProgress,
  readProgress,
  writeProgress,
  markCompleted,
  isCompleted,
  setRoute,
  addGap,
} from "../src/progress.js";

async function tmp(): Promise<string> {
  return await mkdtemp(resolve(tmpdir(), "fmcourse-"));
}

test("default progress shape", () => {
  const p = defaultProgress();
  assert.equal(p.schemaVersion, 1);
  assert.equal(p.learner, "anonymous");
  assert.deepEqual(p.completed, []);
});

test("readProgress returns default when file missing", async () => {
  const dir = await tmp();
  try {
    const p = await readProgress(resolve(dir, "PROGRESS.json"));
    assert.equal(p.schemaVersion, 1);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test("writeProgress roundtrips", async () => {
  const dir = await tmp();
  try {
    const path = resolve(dir, "PROGRESS.json");
    const p = defaultProgress();
    const withCompletion = markCompleted(p, "1.1");
    await writeProgress(path, withCompletion);
    const read = await readProgress(path);
    assert.deepEqual(read.completed, ["1.1"]);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test("markCompleted is idempotent", () => {
  const p = defaultProgress();
  const once = markCompleted(p, "1.1");
  const twice = markCompleted(once, "1.1");
  assert.deepEqual(twice.completed, ["1.1"]);
});

test("isCompleted reflects markCompleted", () => {
  const p = markCompleted(defaultProgress(), "1.1");
  assert.ok(isCompleted(p, "1.1"));
  assert.ok(!isCompleted(p, "1.2"));
});

test("setRoute nests by part", () => {
  const p = setRoute(defaultProgress(), "part-1", "1.1", "skim");
  assert.equal(p.routing["part-1"]["1.1"], "skim");
});

test("addGap deduplicates", () => {
  const p = defaultProgress();
  const once = addGap(p, "1.1", "reread §1.4");
  const twice = addGap(once, "1.1", "reread §1.4");
  assert.equal(twice.gaps["1.1"].length, 1);
});

test("readProgress rejects wrong schema version", async () => {
  const dir = await tmp();
  try {
    const path = resolve(dir, "PROGRESS.json");
    await writeFile(path, JSON.stringify({ schemaVersion: 99 }));
    await assert.rejects(readProgress(path), /schemaVersion must be 1/);
  } finally {
    await rm(dir, { recursive: true });
  }
});
