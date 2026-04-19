import type { Paths } from "./config.js";
import {
  readProgress,
  writeProgress,
  setRoute,
  type Progress,
  type RouteValue,
} from "./progress.js";
import { prompt, promptChoice } from "./util.js";

interface Question {
  id: string;
  text: string;
  /** Modules affected by this question's answer. */
  modules: string[];
  /** If the answer is "yes", what route value is suggested? */
  yesRoute: RouteValue;
  /** If "partially". */
  partiallyRoute: RouteValue;
  /** If "no". */
  noRoute: RouteValue;
}

export const DIAGNOSTIC_VERSION = "2026-04-19";

const QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "Can you write a natural-deduction proof of (P→Q→R) ↔ (P∧Q→R) from memory?",
    modules: ["1.2"],
    yesRoute: "skim",
    partiallyRoute: "full",
    noRoute: "full",
  },
  {
    id: "q2",
    text: "Do you know the difference between ¬¬P→P and P∨¬P in constructive logic?",
    modules: ["1.5"],
    yesRoute: "skim",
    partiallyRoute: "full",
    noRoute: "full",
  },
  {
    id: "q3",
    text: "Have you written a proof by strong induction on naturals?",
    modules: ["1.3"],
    yesRoute: "skim",
    partiallyRoute: "full",
    noRoute: "full",
  },
  {
    id: "q4",
    text: "Can you precisely define equivalence relation and partial order?",
    modules: ["1.1"],
    yesRoute: "skim",
    partiallyRoute: "full",
    noRoute: "full",
  },
  {
    id: "q5",
    text: "Do you know what a fixed point of a monotone function on a complete lattice is?",
    modules: ["1.4"],
    yesRoute: "skim",
    partiallyRoute: "full",
    noRoute: "full",
  },
  {
    id: "q9",
    text: "Have you installed Lean 4 via elan before?",
    modules: ["2.1"],
    yesRoute: "skip",
    partiallyRoute: "skim",
    noRoute: "full",
  },
  {
    id: "q10",
    text: "Can you state what Prop is and how it differs from Type?",
    modules: ["2.4", "2.6"],
    yesRoute: "skim",
    partiallyRoute: "full",
    noRoute: "full",
  },
  {
    id: "q11",
    text: "Have you used rw, simp, or induction as tactics?",
    modules: ["2.5"],
    yesRoute: "skim",
    partiallyRoute: "full",
    noRoute: "full",
  },
  {
    id: "q13",
    text: "Do you know what β-reduction is in the λ-calculus?",
    modules: ["3.1", "4.A"],
    yesRoute: "skim",
    partiallyRoute: "full",
    noRoute: "full",
  },
  {
    id: "q14",
    text: "Have you read about operational semantics (big-step or small-step)?",
    modules: ["3.2", "3.3"],
    yesRoute: "skim",
    partiallyRoute: "full",
    noRoute: "full",
  },
];

function partOfModule(moduleId: string): string {
  const [part] = moduleId.split(".");
  return /^\d+$/.test(part) ? `part-${part}` : "track";
}

function routeFor(
  q: Question,
  answer: "yes" | "partially" | "no",
): RouteValue {
  switch (answer) {
    case "yes":
      return q.yesRoute;
    case "partially":
      return q.partiallyRoute;
    case "no":
      return q.noRoute;
  }
}

export async function runDiagnostic(paths: Paths): Promise<void> {
  process.stdout.write(
    "Running the Part 0 diagnostic. Answer each yes/partially/no.\n" +
      "This calibrates your module routing. See curriculum/00-diagnostic.md.\n\n",
  );

  const existing = await readProgress(paths.progressFile);
  let prog: Progress = { ...existing, diagnosticVersion: DIAGNOSTIC_VERSION };

  for (const q of QUESTIONS) {
    const answer = (await promptChoice(q.text, ["yes", "partially", "no"])) as
      | "yes"
      | "partially"
      | "no";
    const route = routeFor(q, answer);
    for (const m of q.modules) {
      prog = setRoute(prog, partOfModule(m), m, route);
    }
  }

  const name = await prompt("Optional learner name (leave blank to skip): ");
  if (name) prog = { ...prog, learner: name };

  await writeProgress(paths.progressFile, prog);
  process.stdout.write(
    "\nDiagnostic complete. PROGRESS.json updated. Run `fmcourse progress` to see the routing.\n",
  );
}
