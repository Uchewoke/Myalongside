// Thin server-side wrapper around the Anthropic Messages API.
// Requires ANTHROPIC_API_KEY in the environment.

import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";

interface RunAgentArgs {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
}

/** Single non-streaming completion. Returns concatenated text blocks. */
export async function runAgent({ system, messages, maxTokens = 1200 }: RunAgentArgs): Promise<string> {
  const res = await anthropic().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages,
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
