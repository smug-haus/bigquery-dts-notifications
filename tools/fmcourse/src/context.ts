import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative, sep } from "node:path";
import type { Paths } from "./config.js";

/**
 * The tutor's context is assembled here. The critical invariant:
 * **the Solutions/ directory is never read**. Enforced by assertion.
 */

const SOLUTIONS_SEGMENT = `FormalMethodsCourse${sep}Solutions${sep}`;

export function assertNotSolution(absPath: string): void {
  if (absPath.includes(SOLUTIONS_SEGMENT)) {
    throw new Error(
      `context builder refused to read solution file ${absPath}. ` +
        "This is a hard safety invariant of the tutor.",
    );
  }
}

export async function readContextFile(
  paths: Paths,
  relPath: string,
): Promise<string> {
  const abs = resolve(paths.repoRoot, relPath);
  assertNotSolution(abs);
  if (!existsSync(abs)) {
    throw new Error(`context file not found: ${relPath}`);
  }
  return readFile(abs, "utf8");
}

export interface TutorContext {
  /** Text of the learner's exercise file. */
  exerciseText: string;
  /** Path (relative to repo root) of the exercise file. */
  exercisePath: string;
  /** Module notes corresponding to the exercise, if found. */
  moduleNotes: string | null;
  /** Worked-example file for the same module, if found. */
  workedExample: string | null;
  /** The learner's free-text question, if any. */
  question: string;
}

export async function buildTutorContext(
  paths: Paths,
  exerciseFile: string,
  question: string,
): Promise<TutorContext> {
  const abs = resolve(exerciseFile);
  assertNotSolution(abs);
  const exerciseText = await readFile(abs, "utf8");
  const exercisePath = relative(paths.repoRoot, abs);

  const moduleId = detectModuleId(exercisePath);
  const moduleNotes = moduleId
    ? await tryRead(
        resolve(paths.repoRoot, `curriculum/${moduleId}-notes.md`),
      ) ??
      (await tryRead(
        resolve(paths.repoRoot, `curriculum/${curriculumFileFor(moduleId)}`),
      ))
    : null;

  const workedExample = moduleId
    ? await tryRead(
        resolve(
          paths.repoRoot,
          `FormalMethodsCourse/${workedExamplePathFor(exercisePath)}`,
        ),
      )
    : null;

  return { exerciseText, exercisePath, moduleNotes, workedExample, question };
}

async function tryRead(absPath: string): Promise<string | null> {
  assertNotSolution(absPath);
  if (!existsSync(absPath)) return null;
  return readFile(absPath, "utf8");
}

/** Extract a module id like "1.1" from a path such as
 * "Exercises/Part1/Module1_1.lean". */
export function detectModuleId(relPath: string): string | null {
  const m = relPath.match(/Module(\d+)_(\d+)\.lean$/);
  if (!m) return null;
  return `${m[1]}.${m[2]}`;
}

function curriculumFileFor(moduleId: string): string {
  const [part] = moduleId.split(".");
  const files: Record<string, string> = {
    "1": "01-mathematical-foundations.md",
    "2": "02-lean-proof-assistant.md",
    "3": "03-formal-methods-bridge.md",
    "4": "04-cslib-deep-dives.md",
    "5": "05-capstone.md",
  };
  return files[part] ?? "00-diagnostic.md";
}

function workedExamplePathFor(exercisePath: string): string {
  // Exercises/Part1/Module1_1.lean -> Part1/Module1_1.lean
  return exercisePath.replace(/^Exercises[/\\]/, "");
}
