import { homedir } from "node:os";
import { resolve, dirname } from "node:path";
import { existsSync, statSync } from "node:fs";

export interface Paths {
  /** Absolute path to the course repo root. */
  repoRoot: string;
  /** Absolute path to `~/.fmcourse/`. */
  stateDir: string;
  /** Absolute path to the local state JSON file. */
  stateFile: string;
  /** Absolute path to `PROGRESS.json` in the repo. */
  progressFile: string;
  /** Absolute path to the directory of Socratic/tutor transcripts. */
  transcriptsDir: string;
}

/** Walk upward from `start` until we find a directory with SPEC.md. */
export function findRepoRoot(start: string = process.cwd()): string {
  let dir = resolve(start);
  while (true) {
    if (existsSync(resolve(dir, "SPEC.md"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(
        "Not in a Formal Methods course repo (no SPEC.md ancestor).",
      );
    }
    dir = parent;
  }
}

export function resolvePaths(cwd: string = process.cwd()): Paths {
  const repoRoot = findRepoRoot(cwd);
  const stateDir = resolve(homedir(), ".fmcourse");
  return {
    repoRoot,
    stateDir,
    stateFile: resolve(stateDir, "state.json"),
    progressFile: resolve(repoRoot, "PROGRESS.json"),
    transcriptsDir: resolve(stateDir, "transcripts"),
  };
}

/** Exported for tests: let them override the home directory. */
export function resolvePathsWithOverrides(opts: {
  cwd?: string;
  home?: string;
}): Paths {
  const repoRoot = findRepoRoot(opts.cwd ?? process.cwd());
  const stateDir = resolve(opts.home ?? homedir(), ".fmcourse");
  return {
    repoRoot,
    stateDir,
    stateFile: resolve(stateDir, "state.json"),
    progressFile: resolve(repoRoot, "PROGRESS.json"),
    transcriptsDir: resolve(stateDir, "transcripts"),
  };
}

/** True if the repo has a `lakefile.toml`. */
export function hasLakeProject(paths: Paths): boolean {
  const p = resolve(paths.repoRoot, "lakefile.toml");
  return existsSync(p) && statSync(p).isFile();
}
