import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Paths } from "./config.js";
import { buildTutorContext } from "./context.js";
import { makeLlmClient, type LlmMessage } from "./llm.js";
import { addTranscript, readLocalState, writeLocalState } from "./state.js";
import { prompt } from "./util.js";

export async function runTutor(
  paths: Paths,
  exerciseFile: string,
  question: string,
): Promise<void> {
  if (!existsSync(resolve(exerciseFile))) {
    throw new Error(`exercise file not found: ${exerciseFile}`);
  }

  const systemPrompt = await loadPrompt(paths, "tutor");
  const context = await buildTutorContext(paths, exerciseFile, question);
  const llm = makeLlmClient();

  if (llm.offline) {
    process.stdout.write(
      "Tutor running in OFFLINE mode (no ANTHROPIC_API_KEY).\n",
    );
  }

  const userMessage: LlmMessage = {
    role: "user",
    content: renderTutorUserMessage(context),
  };

  const response = await llm.complete({
    system: systemPrompt,
    messages: [userMessage],
    maxTokens: 1024,
  });

  process.stdout.write("\n=== Tutor response ===\n");
  process.stdout.write(response.trim() + "\n");
  process.stdout.write("======================\n");

  await archive(paths, {
    kind: "tutor",
    file: context.exercisePath,
    body: [
      `# Tutor session — ${new Date().toISOString()}`,
      `Exercise: ${context.exercisePath}`,
      `Question: ${question || "(none)"}`,
      "",
      "## Response",
      response.trim(),
    ].join("\n"),
  });
}

function renderTutorUserMessage(ctx: {
  exerciseText: string;
  exercisePath: string;
  moduleNotes: string | null;
  workedExample: string | null;
  question: string;
}): string {
  const parts = [
    `I'm stuck on an exercise in the Formal Methods course.`,
    `Exercise path: ${ctx.exercisePath}`,
    "",
    "## Exercise file",
    "```lean",
    ctx.exerciseText,
    "```",
  ];
  if (ctx.moduleNotes) {
    parts.push("", "## Module notes (excerpt)");
    parts.push(ctx.moduleNotes.slice(0, 4000));
  }
  if (ctx.workedExample) {
    parts.push("", "## Worked example from the same module");
    parts.push("```lean");
    parts.push(ctx.workedExample);
    parts.push("```");
  }
  if (ctx.question) {
    parts.push("", "## My question");
    parts.push(ctx.question);
  }
  parts.push(
    "",
    "Help me see the next step. Do NOT reveal a full solution.",
  );
  return parts.join("\n");
}

async function loadPrompt(paths: Paths, name: string): Promise<string> {
  const p = resolve(paths.repoRoot, "prompts", `${name}.md`);
  if (!existsSync(p)) {
    return (
      "You are a patient Lean 4 tutor. Help the learner see the next " +
      "step. Do not write more than three consecutive tactic steps. " +
      "Never reveal a reference solution."
    );
  }
  return readFile(p, "utf8");
}

async function archive(
  paths: Paths,
  entry: { kind: "tutor" | "socratic"; file?: string; module?: string; body: string },
): Promise<void> {
  await mkdir(paths.transcriptsDir, { recursive: true });
  const name = `${entry.kind}-${Date.now()}.md`;
  const p = resolve(paths.transcriptsDir, name);
  await writeFile(p, entry.body + "\n", "utf8");
  const state = await readLocalState(paths.stateFile);
  const updated = addTranscript(state, {
    kind: entry.kind,
    module: entry.module,
    file: entry.file,
    startedAt: new Date().toISOString(),
    path: p,
  });
  await writeLocalState(paths.stateFile, updated);
}
