import type { Paths } from "./config.js";
import {
  readProgress,
  writeProgress,
  markCompleted,
  isCompleted,
} from "./progress.js";

export async function showProgress(paths: Paths): Promise<void> {
  const prog = await readProgress(paths.progressFile);
  process.stdout.write(`Learner: ${prog.learner}\n`);
  process.stdout.write(
    `Diagnostic version: ${prog.diagnosticVersion ?? "(not run)"}\n`,
  );
  process.stdout.write(`Last activity: ${prog.lastActivity}\n`);
  process.stdout.write(`Completed modules (${prog.completed.length}):\n`);
  for (const m of prog.completed) process.stdout.write(`  - ${m}\n`);
  process.stdout.write("\nRouting:\n");
  const parts = Object.keys(prog.routing).sort();
  if (parts.length === 0) {
    process.stdout.write("  (empty — run `fmcourse diagnostic`)\n");
  } else {
    for (const part of parts) {
      process.stdout.write(`  ${part}:\n`);
      const entries = Object.entries(prog.routing[part]).sort(([a], [b]) =>
        a.localeCompare(b),
      );
      for (const [m, r] of entries) {
        process.stdout.write(`    ${m}  ${r}\n`);
      }
    }
  }
  const gapModules = Object.keys(prog.gaps);
  if (gapModules.length > 0) {
    process.stdout.write("\nOpen gaps:\n");
    for (const m of gapModules) {
      for (const g of prog.gaps[m]) {
        process.stdout.write(`  [${m}] ${g}\n`);
      }
    }
  }
}

export async function completeModule(
  paths: Paths,
  moduleId: string,
): Promise<void> {
  const prog = await readProgress(paths.progressFile);
  if (isCompleted(prog, moduleId)) {
    process.stdout.write(`Module ${moduleId} is already marked complete.\n`);
    return;
  }
  const updated = markCompleted(prog, moduleId);
  await writeProgress(paths.progressFile, updated);
  process.stdout.write(`Marked module ${moduleId} complete.\n`);
  process.stdout.write(
    `Next step: run \`fmcourse socratic ${moduleId}\` for the end-of-module chat.\n`,
  );
}
