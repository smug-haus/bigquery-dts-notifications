import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(question);
    return answer.trim();
  } finally {
    rl.close();
  }
}

export async function promptChoice(
  question: string,
  choices: readonly string[],
): Promise<string> {
  const hint = `[${choices.join("/")}]`;
  while (true) {
    const raw = (await prompt(`${question} ${hint} `)).toLowerCase();
    const match = choices.find((c) => c.toLowerCase() === raw);
    if (match !== undefined) return match;
    process.stderr.write(`please enter one of ${hint}\n`);
  }
}

export function todayIso(): string {
  return new Date().toISOString();
}

export function parseFlags(
  argv: string[],
): { positional: string[]; flags: Record<string, string | true> } {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq !== -1) {
        flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        flags[a.slice(2)] = argv[++i];
      } else {
        flags[a.slice(2)] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

export class UsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}
