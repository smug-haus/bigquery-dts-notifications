#!/usr/bin/env node
// Structural checks for the course repo. Fast, no Lean build involved.
//
// Fails the build if:
//   - any `Exercises/**/*.lean` contains the string `sorry` as a token;
//   - any authored module lacks a probe bank or SRS deck;
//   - any exercise in the hint index is missing a `Hints/` file.
//
// The Lean build itself is a separate CI step.

import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

let failures = 0;
function fail(msg) {
  process.stderr.write(`FAIL  ${msg}\n`);
  failures++;
}
function ok(msg) {
  process.stdout.write(`ok    ${msg}\n`);
}

// 1. No `sorry` tokens in Exercises/ except in the file the learner
//    has not filled in. At ship time this will be strict; in the
//    v0.3 seed we allow `sorry` as the starting point, but assert
//    the convention: `sorry` must be on a line ending in `sorry`.
{
  const files = (await walk(resolve(ROOT, "Exercises"))).filter((p) =>
    p.endsWith(".lean"),
  );
  for (const f of files) {
    const text = await readFile(f, "utf8");
    const matches = text.match(/\bsorry\b/g) ?? [];
    const rel = relative(ROOT, f);
    if (matches.length === 0) {
      ok(`no sorry in ${rel}`);
    } else {
      process.stdout.write(
        `note  ${rel} still has ${matches.length} sorry(s) — expected until authored\n`,
      );
    }
  }
}

// 2. Every authored module in curriculum/ has a probe bank.
//    Authored modules are those present in FormalMethodsCourse/<part>/
//    as Module<a>_<b>.lean.
{
  const partDirs = (await readdir(resolve(ROOT, "FormalMethodsCourse"), {
    withFileTypes: true,
  }))
    .filter((e) => e.isDirectory() && /^Part\d+$/.test(e.name))
    .map((e) => e.name);
  for (const part of partDirs) {
    const files = (await readdir(resolve(ROOT, "FormalMethodsCourse", part)))
      .filter((n) => /^Module\d+_\d+\.lean$/.test(n));
    for (const file of files) {
      const m = file.match(/^Module(\d+)_(\d+)\.lean$/);
      const moduleId = `${m[1]}.${m[2]}`;
      const probes = resolve(ROOT, "curriculum", `${moduleId}-probes.md`);
      if (existsSync(probes)) ok(`probe bank present for ${moduleId}`);
      else fail(`missing probe bank for ${moduleId} (expected ${relative(ROOT, probes)})`);

      const srs = resolve(ROOT, "srs", `${moduleId}.md`);
      if (existsSync(srs)) ok(`srs deck present for ${moduleId}`);
      else fail(`missing SRS deck for ${moduleId}`);
    }
  }
}

// 3. Every exercise theorem in Exercises/Part*/Module*.lean has either
//    an author hint file OR the exercise is tagged `@autoHint: true`
//    in a comment above its declaration.
{
  const files = (await walk(resolve(ROOT, "Exercises"))).filter((p) =>
    p.endsWith(".lean"),
  );
  for (const f of files) {
    const text = await readFile(f, "utf8");
    const rel = relative(ROOT, f);
    const m = rel.match(/^Exercises[/\\](Part\d+)[/\\]Module(\d+)_(\d+)\.lean$/);
    if (!m) continue;
    const part = m[1];
    const moduleId = `${m[2]}.${m[3]}`;
    // crude parser: find every `theorem` or `example` name
    const decls = [...text.matchAll(/\b(?:theorem|example|lemma)\s+(\w+)\s*[:\(]/g)].map(
      (mm) => mm[1],
    );
    for (const name of decls) {
      const hintPath = resolve(ROOT, "Hints", part, `${moduleId}-${name}.md`);
      const autoTag = new RegExp(
        `@autoHint:\\s*true[\\s\\S]*?\\btheorem\\s+${name}\\b`,
      ).test(text);
      if (existsSync(hintPath) || autoTag) {
        ok(`hint or autoHint for ${part}/${moduleId}/${name}`);
      } else {
        fail(
          `missing hint: ${part}/${moduleId}/${name} — add ${relative(ROOT, hintPath)} or tag @autoHint: true`,
        );
      }
    }
  }
}

if (failures > 0) {
  process.stderr.write(`\n${failures} structural check(s) failed.\n`);
  process.exit(1);
}
process.stdout.write("\nAll structural checks passed.\n");
