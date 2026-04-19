import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Paths } from "./config.js";
import { makeLlmClient, type LlmMessage } from "./llm.js";
import { addTranscript, readLocalState, writeLocalState } from "./state.js";
import {
  readProgress,
  writeProgress,
  addGap,
  type Progress,
} from "./progress.js";
import { prompt, promptChoice } from "./util.js";
import { readContextFile } from "./context.js";

/**
 * Run an end-of-module Socratic chat. The LLM sees: module notes, the
 * probe bank, and the learner's earlier concept-check answers (if
 * stored). It asks 5-8 questions, then emits a gap report.
 */
export async function runSocratic(
  paths: Paths,
  moduleId: string,
): Promise<void> {
  const systemPrompt = await loadPrompt(paths, "socratic");
  const probes = await readProbeBank(paths, moduleId);
  const notes = await readModuleNotes(paths, moduleId);
  const llm = makeLlmClient();

  if (llm.offline) {
    process.stdout.write(
      "Socratic chat running OFFLINE. The LLM will not be called — a " +
        "static prompt bank will walk you through probes.\n",
    );
    await runOfflineSocratic(paths, moduleId, probes);
    return;
  }

  const seedContent = [
    `Module: ${moduleId}`,
    "",
    "## Module notes",
    notes ?? "(not available)",
    "",
    "## Probe bank",
    probes,
    "",
    "Begin the Socratic dialogue. Ask your first question.",
  ].join("\n");

  const history: LlmMessage[] = [
    { role: "user", content: seedContent },
  ];

  const transcriptLines: string[] = [
    `# Socratic — module ${moduleId} — ${new Date().toISOString()}`,
    "",
  ];

  for (let turn = 0; turn < 8; turn++) {
    const ask = await llm.complete({
      system: systemPrompt,
      messages: history,
      maxTokens: 400,
    });
    process.stdout.write(`\nTutor: ${ask.trim()}\n`);
    transcriptLines.push(`**Tutor:** ${ask.trim()}`, "");
    history.push({ role: "assistant", content: ask });

    if (/FINAL GAP REPORT/.test(ask)) break;

    const answer = await prompt("You: ");
    if (answer === "" || answer === "/quit") break;
    transcriptLines.push(`**You:** ${answer}`, "");
    history.push({
      role: "user",
      content:
        turn === 6
          ? `${answer}\n\nNow wrap up. Emit a FINAL GAP REPORT as a ` +
            "bulleted list of sections the learner should re-read."
          : answer,
    });
  }

  const gaps = extractGaps(transcriptLines.join("\n"));
  if (gaps.length > 0) {
    let prog = await readProgress(paths.progressFile);
    for (const g of gaps) prog = addGap(prog, moduleId, g);
    await writeProgress(paths.progressFile, prog);
    process.stdout.write(
      `\nRecorded ${gaps.length} gap(s) to PROGRESS.json.\n`,
    );
  }

  await archive(paths, {
    kind: "socratic",
    module: moduleId,
    body: transcriptLines.join("\n"),
  });
}

async function runOfflineSocratic(
  paths: Paths,
  moduleId: string,
  probeText: string,
): Promise<void> {
  const probes = splitProbes(probeText);
  if (probes.length === 0) {
    process.stdout.write(`No probes found for module ${moduleId}.\n`);
    return;
  }
  const transcript: string[] = [
    `# Socratic (offline) — module ${moduleId} — ${new Date().toISOString()}`,
    "",
  ];
  let unanswered = 0;
  for (const probe of probes.slice(0, 6)) {
    process.stdout.write(`\n-- ${probe.title} --\n${probe.seed}\n`);
    const answer = await prompt("You (or 'skip'): ");
    transcript.push(`**Probe:** ${probe.title}`, "", probe.seed, "");
    transcript.push(`**You:** ${answer}`, "");
    if (answer === "skip" || answer === "") unanswered++;
  }
  if (unanswered > probes.length / 2) {
    let prog = await readProgress(paths.progressFile);
    prog = addGap(prog, moduleId, "Offline socratic: >50% probes skipped.");
    await writeProgress(paths.progressFile, prog);
  }
  await archive(paths, {
    kind: "socratic",
    module: moduleId,
    body: transcript.join("\n"),
  });
}

interface Probe {
  title: string;
  seed: string;
}

function splitProbes(text: string): Probe[] {
  const chunks = text.split(/\n## Probe: /).slice(1);
  const probes: Probe[] = [];
  for (const chunk of chunks) {
    const nl = chunk.indexOf("\n");
    const title = chunk.slice(0, nl).trim();
    const seedLine = chunk
      .split("\n")
      .find((l) => l.startsWith("Seed question:"));
    if (!seedLine) continue;
    probes.push({ title, seed: seedLine.replace(/^Seed question:\s*/, "") });
  }
  return probes;
}

function extractGaps(transcript: string): string[] {
  const m = transcript.match(/FINAL GAP REPORT[\s\S]*$/);
  if (!m) return [];
  const bullets = m[0]
    .split("\n")
    .filter((l) => /^[-*]/.test(l.trim()))
    .map((l) => l.trim().replace(/^[-*]\s*/, ""));
  return bullets;
}

async function readProbeBank(
  paths: Paths,
  moduleId: string,
): Promise<string> {
  const p = resolve(paths.repoRoot, "curriculum", `${moduleId}-probes.md`);
  if (!existsSync(p)) return "(no probe bank found)";
  return readFile(p, "utf8");
}

async function readModuleNotes(
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

async function loadPrompt(paths: Paths, name: string): Promise<string> {
  const p = resolve(paths.repoRoot, "prompts", `${name}.md`);
  if (!existsSync(p)) {
    return (
      "You are a Socratic teacher for the Formal Methods course. " +
      "Ask one question at a time. Use the probe bank as anchors. " +
      "After six probes, emit a FINAL GAP REPORT."
    );
  }
  return readFile(p, "utf8");
}

async function archive(
  paths: Paths,
  entry: { kind: "tutor" | "socratic"; module?: string; file?: string; body: string },
): Promise<void> {
  await mkdir(paths.transcriptsDir, { recursive: true });
  const name = `${entry.kind}-${entry.module ?? "generic"}-${Date.now()}.md`;
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
