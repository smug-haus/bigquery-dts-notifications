import Anthropic from "@anthropic-ai/sdk";

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LlmClient {
  complete(args: {
    system: string;
    messages: LlmMessage[];
    maxTokens?: number;
  }): Promise<string>;
  readonly offline: boolean;
}

const DEFAULT_MODEL = process.env.FMCOURSE_MODEL ?? "claude-sonnet-4-6";

export function makeLlmClient(): LlmClient {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return offlineClient();
  const client = new Anthropic({ apiKey: key });
  return {
    offline: false,
    async complete({ system, messages, maxTokens = 1024 }) {
      const response = await client.messages.create({
        model: DEFAULT_MODEL,
        system,
        max_tokens: maxTokens,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });
      const text = response.content
        .filter((block) => block.type === "text")
        .map((block) => (block as { text: string }).text)
        .join("\n");
      return text;
    },
  };
}

export function offlineClient(): LlmClient {
  return {
    offline: true,
    async complete({ messages }) {
      const last = messages[messages.length - 1]?.content ?? "";
      return stuckPlaybook(last);
    },
  };
}

/**
 * A deterministic offline fallback. Triggers on common Lean goal
 * shapes in the learner's message and returns generic guidance. Not a
 * replacement for the LLM tutor — a stopgap for flights and outages.
 */
export function stuckPlaybook(text: string): string {
  const lower = text.toLowerCase();
  const hints: string[] = [];
  if (/∀|forall|for all/.test(lower)) {
    hints.push("- For a `∀`, start with `intro`.");
  }
  if (/∃|exists/.test(lower)) {
    hints.push(
      "- For an `∃` goal, provide a witness with `exact ⟨w, _⟩` or `use w`.",
    );
  }
  if (/∧|and/.test(lower)) {
    hints.push("- For a `∧` goal, use `exact ⟨_, _⟩` or `constructor`.");
  }
  if (/∨|or/.test(lower)) {
    hints.push("- For a `∨` goal, commit with `Or.inl` or `Or.inr`.");
  }
  if (/induction/.test(lower) || /rec/.test(lower)) {
    hints.push(
      "- For an inductive hypothesis, `induction h with | refl => ... | tail _ step ih => ...`.",
    );
  }
  if (/rfl|refl|equal/.test(lower)) {
    hints.push("- `rfl` closes syntactic equality; `rw [h]` rewrites.");
  }
  if (hints.length === 0) {
    hints.push(
      "- No API key found and no obvious goal shape. Try `simp`, `exact?`, or `apply?`.",
    );
  }
  return [
    "Tutor unavailable (no ANTHROPIC_API_KEY). Offline playbook:",
    ...hints,
    "",
    "Set ANTHROPIC_API_KEY to enable the real tutor.",
  ].join("\n");
}
