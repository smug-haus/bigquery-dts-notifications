import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { existsSync } from "node:fs";

/**
 * Local-state schema. Stored as JSON at `~/.fmcourse/state.json`.
 *
 * The interactive-layer spec describes this as a SQLite database. For
 * v0.3 we use JSON for portability (no native-build dependency). The
 * schema below is intentionally close to a relational shape so a
 * future SQLite migration is straightforward.
 */
export interface LocalState {
  schemaVersion: 1;
  hintGrants: HintGrant[];
  srsCards: SrsCard[];
  transcripts: TranscriptRef[];
}

export interface HintGrant {
  exercise: string;
  level: 1 | 2 | 3 | 4;
  timestamp: string;
  source: "author" | "auto";
}

export interface SrsCard {
  id: string;
  module: string;
  front: string;
  back: string;
  tags: string[];
  /** SM-2 state. */
  interval: number;
  repetition: number;
  ease: number;
  dueAt: string;
  introduced: boolean;
  auto?: boolean;
}

export interface TranscriptRef {
  kind: "tutor" | "socratic";
  module?: string;
  file?: string;
  startedAt: string;
  path: string;
}

export function defaultLocalState(): LocalState {
  return {
    schemaVersion: 1,
    hintGrants: [],
    srsCards: [],
    transcripts: [],
  };
}

export async function readLocalState(path: string): Promise<LocalState> {
  if (!existsSync(path)) return defaultLocalState();
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as Partial<LocalState>;
  if (parsed.schemaVersion !== 1) {
    throw new Error(
      `state.json schemaVersion must be 1, got ${parsed.schemaVersion}.`,
    );
  }
  const def = defaultLocalState();
  return {
    schemaVersion: 1,
    hintGrants: parsed.hintGrants ?? def.hintGrants,
    srsCards: parsed.srsCards ?? def.srsCards,
    transcripts: parsed.transcripts ?? def.transcripts,
  };
}

export async function writeLocalState(
  path: string,
  state: LocalState,
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(state, null, 2) + "\n", "utf8");
}

export function recordHintGrant(
  state: LocalState,
  grant: HintGrant,
): LocalState {
  return { ...state, hintGrants: [...state.hintGrants, grant] };
}

export function addTranscript(
  state: LocalState,
  ref: TranscriptRef,
): LocalState {
  return { ...state, transcripts: [...state.transcripts, ref] };
}
