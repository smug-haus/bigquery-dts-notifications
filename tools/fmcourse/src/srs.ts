import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Paths } from "./config.js";
import {
  readLocalState,
  writeLocalState,
  type LocalState,
  type SrsCard,
} from "./state.js";
import { prompt } from "./util.js";

/**
 * SM-2 spaced repetition. Cards are Markdown with frontmatter under
 * `srs/<module>.md`; SM-2 state (interval, ease, repetition, dueAt)
 * lives in the local state file.
 */

const MIN_EASE = 1.3;

export async function loadAllCards(paths: Paths): Promise<SrsCard[]> {
  const dir = resolve(paths.repoRoot, "srs");
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  const out: SrsCard[] = [];
  for (const f of files) {
    const body = await readFile(resolve(dir, f), "utf8");
    for (const card of parseCards(body)) out.push(card);
  }
  return out;
}

export function parseCards(md: string): SrsCard[] {
  const blocks = md.split(/```card\s*\n/).slice(1);
  const cards: SrsCard[] = [];
  for (const block of blocks) {
    const end = block.indexOf("```");
    if (end === -1) continue;
    const raw = block.slice(0, end);
    const [frontmatterRaw, rest] = raw.split(/---\n/, 2).slice(0, 2);
    if (!rest) continue;
    const fm = parseFrontmatter(frontmatterRaw);
    const qIdx = rest.indexOf("Q:");
    const aIdx = rest.indexOf("\nA:");
    if (qIdx === -1 || aIdx === -1) continue;
    const front = rest.slice(qIdx + 2, aIdx).trim();
    const back = rest.slice(aIdx + 3).trim();
    cards.push({
      id: String(fm.id ?? `auto-${cards.length}`),
      module: String(fm.module ?? ""),
      front,
      back,
      tags: parseList(fm.tags),
      interval: 0,
      repetition: 0,
      ease: 2.5,
      dueAt: new Date().toISOString(),
      introduced: false,
    });
  }
  return cards;
}

function parseFrontmatter(s: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const line of s.split("\n")) {
    const m = line.match(/^([a-zA-Z][a-zA-Z0-9_]*):\s*(.+)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^"|"$/g, "");
  }
  return out;
}

function parseList(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  const s = String(raw).replace(/^\[|\]$/g, "");
  return s
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

export async function review(
  paths: Paths,
  opts: { newCards: number },
): Promise<void> {
  const state = await readLocalState(paths.stateFile);
  const authored = await loadAllCards(paths);
  const merged = mergeCards(state.srsCards, authored);

  const now = Date.now();
  const due = merged
    .filter((c) => c.introduced && Date.parse(c.dueAt) <= now)
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
  const newPool = merged.filter((c) => !c.introduced).slice(0, opts.newCards);

  const queue = [...due, ...newPool];
  if (queue.length === 0) {
    process.stdout.write("No cards due and no new cards queued. Come back tomorrow.\n");
    return;
  }
  process.stdout.write(
    `Reviewing ${due.length} due + ${newPool.length} new card(s). (q to quit)\n`,
  );

  const byId = new Map(merged.map((c) => [c.id, c]));
  for (const card of queue) {
    process.stdout.write(`\n[${card.id}] ${card.front}\n`);
    const cmd = await prompt("Reveal? (y/q): ");
    if (cmd === "q") break;
    process.stdout.write(`\n${card.back}\n`);
    const grade = await prompt("Grade 0-5 (0=blanked, 5=easy): ");
    const n = Number.parseInt(grade, 10);
    if (Number.isNaN(n) || n < 0 || n > 5) {
      process.stdout.write("Invalid grade — skipping card.\n");
      continue;
    }
    const updated = sm2(card, n);
    byId.set(card.id, { ...updated, introduced: true });
  }

  const nextCards = Array.from(byId.values());
  const nextState: LocalState = { ...state, srsCards: nextCards };
  await writeLocalState(paths.stateFile, nextState);
  process.stdout.write("\nReview session saved.\n");
}

function mergeCards(local: SrsCard[], authored: SrsCard[]): SrsCard[] {
  const byId = new Map(local.map((c) => [c.id, c]));
  for (const c of authored) {
    const existing = byId.get(c.id);
    byId.set(
      c.id,
      existing
        ? { ...c, ...existing, front: c.front, back: c.back, tags: c.tags }
        : c,
    );
  }
  return Array.from(byId.values());
}

/** Canonical SM-2 update. Grade q is 0-5. */
export function sm2(card: SrsCard, q: number): SrsCard {
  let { interval, repetition, ease } = card;
  if (q < 3) {
    repetition = 0;
    interval = 1;
  } else {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * ease);
    repetition += 1;
    ease = Math.max(
      MIN_EASE,
      ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
    );
  }
  const due = new Date();
  due.setDate(due.getDate() + interval);
  return { ...card, interval, repetition, ease, dueAt: due.toISOString() };
}

/**
 * Export cards to a minimal Anki-readable TSV (not a full .apkg, which
 * needs a DB). Anki imports TSV directly; this satisfies the
 * "Anki-exportable" spec requirement without a native dependency.
 */
export async function exportAnki(
  paths: Paths,
  opts: { module?: string; outPath: string },
): Promise<void> {
  const cards = await loadAllCards(paths);
  const filtered = opts.module
    ? cards.filter((c) => c.module === opts.module)
    : cards;
  const lines = ["#separator:tab", "#html:false"];
  for (const c of filtered) {
    const front = c.front.replace(/\t/g, " ");
    const back = c.back.replace(/\t/g, " ").replace(/\n/g, "<br>");
    const tags = c.tags.join(" ");
    lines.push(`${c.id}\t${front}\t${back}\t${tags}`);
  }
  await mkdir(resolve(opts.outPath, ".."), { recursive: true });
  await writeFile(opts.outPath, lines.join("\n") + "\n", "utf8");
  process.stdout.write(`Wrote ${filtered.length} cards to ${opts.outPath}\n`);
}
