import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { existsSync } from "node:fs";

export type RouteValue = "full" | "skim" | "skip";

export interface Progress {
  schemaVersion: 1;
  learner: string;
  diagnosticVersion: string | null;
  routing: Record<string, Record<string, RouteValue>>;
  completed: string[];
  gaps: Record<string, string[]>;
  lastActivity: string;
}

export function defaultProgress(): Progress {
  return {
    schemaVersion: 1,
    learner: "anonymous",
    diagnosticVersion: null,
    routing: {},
    completed: [],
    gaps: {},
    lastActivity: new Date().toISOString(),
  };
}

export async function readProgress(path: string): Promise<Progress> {
  if (!existsSync(path)) return defaultProgress();
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as Partial<Progress>;
  return validate(parsed);
}

export async function writeProgress(
  path: string,
  prog: Progress,
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const next = { ...prog, lastActivity: new Date().toISOString() };
  await writeFile(path, JSON.stringify(next, null, 2) + "\n", "utf8");
}

function validate(p: Partial<Progress>): Progress {
  if (p.schemaVersion !== 1) {
    throw new Error(
      `PROGRESS.json schemaVersion must be 1, got ${p.schemaVersion}.`,
    );
  }
  const def = defaultProgress();
  return {
    schemaVersion: 1,
    learner: p.learner ?? def.learner,
    diagnosticVersion: p.diagnosticVersion ?? null,
    routing: p.routing ?? {},
    completed: p.completed ?? [],
    gaps: p.gaps ?? {},
    lastActivity: p.lastActivity ?? def.lastActivity,
  };
}

export function markCompleted(prog: Progress, moduleId: string): Progress {
  if (prog.completed.includes(moduleId)) return prog;
  return { ...prog, completed: [...prog.completed, moduleId] };
}

export function isCompleted(prog: Progress, moduleId: string): boolean {
  return prog.completed.includes(moduleId);
}

export function setRoute(
  prog: Progress,
  part: string,
  moduleId: string,
  value: RouteValue,
): Progress {
  const partMap = { ...(prog.routing[part] ?? {}) };
  partMap[moduleId] = value;
  return { ...prog, routing: { ...prog.routing, [part]: partMap } };
}

export function addGap(
  prog: Progress,
  moduleId: string,
  gap: string,
): Progress {
  const existing = prog.gaps[moduleId] ?? [];
  if (existing.includes(gap)) return prog;
  return {
    ...prog,
    gaps: { ...prog.gaps, [moduleId]: [...existing, gap] },
  };
}
