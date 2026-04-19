import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Paths } from "./config.js";
import { readLocalState, writeLocalState, recordHintGrant } from "./state.js";
import { prompt } from "./util.js";
import { makeLlmClient } from "./llm.js";
import { readContextFile, assertNotSolution } from "./context.js";

export interface HintRequest {
  exercise: string;
  level: 1 | 2 | 3 | 4;
  reveal: boolean;
}

/**
 * Produce a hint at the requested level. Levels 1-3 come from
 * author-written Markdown under `Hints/`. Level 4 is the reference
 * solution from `FormalMethodsCourse/Solutions/` and requires
 * `--reveal`.
 *
 * If no author-written hint file exists, levels 1-3 fall through to
 * an LLM-generated hint (clearly marked auto-generated).
 */
export async function serveHint(
  paths: Paths,
  req: HintRequest,
): Promise<string> {
  const { exercise, level, reveal } = req;
  if (level === 4 && !reveal) {
    return (
      "Level 4 is the full reference solution. Pass --reveal to unlock.\n" +
      "Before you do, write one paragraph in PROGRESS.md describing what you tried."
    );
  }

  if (level === 4) {
    return await serveLevel4(paths, exercise);
  }

  const authored = await readAuthorHint(paths, exercise);
  const output = authored
    ? extractLevel(authored, level)
    : await generateHint(paths, exercise, level);

  await logGrant(paths, {
    exercise,
    level,
    source: authored ? "author" : "auto",
  });
  return output;
}

export function hintPathFor(paths: Paths, exercise: string): string {
  // "Part1/1.1/subset_antisymm" -> "Hints/Part1/1.1-subset_antisymm.md"
  const parts = exercise.split("/");
  if (parts.length !== 3) {
    throw new Error(
      `exercise id must be Part<N>/<module>/<name>; got ${exercise}`,
    );
  }
  const [part, moduleId, name] = parts;
  return resolve(paths.repoRoot, "Hints", part, `${moduleId}-${name}.md`);
}

export function solutionPathFor(paths: Paths, exercise: string): string {
  const [part, moduleId] = exercise.split("/");
  const m = moduleId.match(/^(\d+)\.(\d+)$/);
  if (!m) throw new Error(`module id must be N.N; got ${moduleId}`);
  return resolve(
    paths.repoRoot,
    "FormalMethodsCourse",
    "Solutions",
    part,
    `Module${m[1]}_${m[2]}.lean`,
  );
}

async function readAuthorHint(
  paths: Paths,
  exercise: string,
): Promise<string | null> {
  const p = hintPathFor(paths, exercise);
  if (!existsSync(p)) return null;
  return readFile(p, "utf8");
}

function extractLevel(doc: string, level: 1 | 2 | 3): string {
  const marker = `## Level ${level}`;
  const start = doc.indexOf(marker);
  if (start === -1) {
    return `(Level ${level} not authored for this exercise.)`;
  }
  const rest = doc.slice(start + marker.length);
  const nextLevel = rest.search(/\n## Level \d/);
  return (
    (nextLevel === -1 ? rest : rest.slice(0, nextLevel)).trim() + "\n"
  );
}

async function generateHint(
  paths: Paths,
  exercise: string,
  level: 1 | 2 | 3,
): Promise<string> {
  const llm = makeLlmClient();
  const [part, moduleId, name] = exercise.split("/");
  const exerciseFile = resolve(
    paths.repoRoot,
    "Exercises",
    part,
    `Module${moduleId.replace(".", "_")}.lean`,
  );
  assertNotSolution(exerciseFile);
  const exerciseText = existsSync(exerciseFile)
    ? await readFile(exerciseFile, "utf8")
    : "";

  const notes = await readCurriculumNotes(paths, moduleId);
  const levelDescription = {
    1: "A one-sentence nudge. No Lean code.",
    2: "A proof sketch in English. Three to six bullet points.",
    3: "A Lean proof skeleton with `sorry` holes at the hard parts.",
  }[level];

  const response = await llm.complete({
    system:
      "You are generating a progressive hint for a Lean 4 exercise in a formal methods course. " +
      "Do not write a complete proof. Stay within the requested hint level.",
    messages: [
      {
        role: "user",
        content:
          `Exercise id: ${exercise}\n\n` +
          `Module notes:\n${notes ?? "(not available)"}\n\n` +
          `Exercise file:\n\`\`\`lean\n${exerciseText}\n\`\`\`\n\n` +
          `Produce a Level ${level} hint for the exercise named "${name}". ` +
          `${levelDescription}`,
      },
    ],
    maxTokens: 600,
  });
  return (
    `(auto-generated — no author hint on file)\n\n` + response.trim() + "\n"
  );
}

async function readCurriculumNotes(
  paths: Paths,
  moduleId: string,
): Promise<string | null> {
  const [part] = moduleId.split(".");
  const filename = {
    "1": "01-mathematical-foundations.md",
    "2": "02-lean-proof-assistant.md",
    "3": "03-formal-methods-bridge.md",
    "4": "04-cslib-deep-dives.md",
    "5": "05-capstone.md",
  }[part];
  if (!filename) return null;
  try {
    return await readContextFile(paths, `curriculum/${filename}`);
  } catch {
    return null;
  }
}

async function serveLevel4(paths: Paths, exercise: string): Promise<string> {
  const reflection = await prompt(
    "Reveal gate: in one sentence, what did you try? ",
  );
  if (reflection.length < 10) {
    return (
      "Reflection too brief (< 10 characters). Try again when you have a " +
      "real sentence to describe what you attempted. The solution will wait."
    );
  }
  const solutionPath = solutionPathFor(paths, exercise);
  if (!existsSync(solutionPath)) {
    return `(no reference solution file at ${solutionPath})`;
  }
  const body = await readFile(solutionPath, "utf8");
  await logGrant(paths, { exercise, level: 4, source: "author" });
  return [
    `# Reference solution for ${exercise}`,
    `(you recorded: ${reflection})`,
    "",
    "```lean",
    body,
    "```",
  ].join("\n");
}

async function logGrant(
  paths: Paths,
  entry: { exercise: string; level: 1 | 2 | 3 | 4; source: "author" | "auto" },
): Promise<void> {
  const state = await readLocalState(paths.stateFile);
  const updated = recordHintGrant(state, {
    ...entry,
    timestamp: new Date().toISOString(),
  });
  await writeLocalState(paths.stateFile, updated);
}
