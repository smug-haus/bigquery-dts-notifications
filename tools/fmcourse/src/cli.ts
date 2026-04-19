#!/usr/bin/env node
import { resolvePaths } from "./config.js";
import { runDiagnostic } from "./diagnostic.js";
import { completeModule, showProgress } from "./commandsBasic.js";
import { serveHint } from "./hint.js";
import { runTutor } from "./tutor.js";
import { runSocratic } from "./socratic.js";
import { review, exportAnki } from "./srs.js";
import { parseFlags, UsageError } from "./util.js";
import { resolve } from "node:path";

const HELP = `
fmcourse — interactive companion for the Formal Methods course

Usage:
  fmcourse diagnostic                           Run the Part 0 diagnostic.
  fmcourse progress                             Show routing and completion.
  fmcourse complete <module>                    Mark a module as done.
  fmcourse hint --exercise <id> --level N       Serve a hint.
                [--reveal]                      (required for level 4)
  fmcourse tutor <file> [--question "..."]      Ask the LLM tutor.
  fmcourse socratic <module>                    End-of-module Socratic chat.
  fmcourse review [--new N]                     Daily SRS review.
  fmcourse srs export-anki --out <path>         Export cards as Anki TSV.
                         [--module <id>]

Flags:
  --help, -h        Show this message.

Environment:
  ANTHROPIC_API_KEY   Enables the real tutor & Socratic chat. Without
                      it, commands fall back to offline playbooks.
  FMCOURSE_MODEL      Override the model name (default: claude-sonnet-4-6).
`.trimStart();

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  if (argv.length === 0 || argv[0] === "-h" || argv[0] === "--help") {
    process.stdout.write(HELP);
    return 0;
  }

  const [cmd, ...rest] = argv;
  const paths = resolvePaths();

  try {
    switch (cmd) {
      case "diagnostic": {
        await runDiagnostic(paths);
        return 0;
      }
      case "progress": {
        await showProgress(paths);
        return 0;
      }
      case "complete": {
        const moduleId = rest[0];
        if (!moduleId) throw new UsageError("complete: module id required");
        await completeModule(paths, moduleId);
        return 0;
      }
      case "hint": {
        const { flags } = parseFlags(rest);
        const exercise = String(flags.exercise ?? "");
        const level = Number(flags.level ?? 1);
        if (!exercise) throw new UsageError("hint: --exercise required");
        if (![1, 2, 3, 4].includes(level)) {
          throw new UsageError("hint: --level must be 1, 2, 3, or 4");
        }
        const reveal = flags.reveal === true;
        const out = await serveHint(paths, {
          exercise,
          level: level as 1 | 2 | 3 | 4,
          reveal,
        });
        process.stdout.write(out + "\n");
        return 0;
      }
      case "tutor": {
        const { positional, flags } = parseFlags(rest);
        const file = positional[0];
        if (!file) throw new UsageError("tutor: exercise file required");
        const question = typeof flags.question === "string" ? flags.question : "";
        await runTutor(paths, file, question);
        return 0;
      }
      case "socratic": {
        const moduleId = rest[0];
        if (!moduleId) throw new UsageError("socratic: module id required");
        await runSocratic(paths, moduleId);
        return 0;
      }
      case "review": {
        const { flags } = parseFlags(rest);
        const newCards = Number(flags.new ?? 0);
        await review(paths, { newCards });
        return 0;
      }
      case "srs": {
        const [sub, ...srsRest] = rest;
        if (sub !== "export-anki") {
          throw new UsageError(`srs: unknown subcommand ${sub}`);
        }
        const { flags } = parseFlags(srsRest);
        const out = flags.out;
        if (typeof out !== "string") {
          throw new UsageError("srs export-anki: --out <path> required");
        }
        const module =
          typeof flags.module === "string" ? flags.module : undefined;
        await exportAnki(paths, {
          module,
          outPath: resolve(process.cwd(), out),
        });
        return 0;
      }
      default:
        process.stderr.write(`Unknown command: ${cmd}\n\n${HELP}`);
        return 2;
    }
  } catch (err) {
    if (err instanceof UsageError) {
      process.stderr.write(`usage error: ${err.message}\n`);
      return 2;
    }
    process.stderr.write(
      `error: ${err instanceof Error ? err.message : String(err)}\n`,
    );
    if (process.env.FMCOURSE_DEBUG && err instanceof Error && err.stack) {
      process.stderr.write(err.stack + "\n");
    }
    return 1;
  }
}

// Allow `node cli.js` and `fmcourse`.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((code) => process.exit(code));
}
