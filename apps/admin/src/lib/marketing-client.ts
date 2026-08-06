// Browser-side helpers for the AI marketing team. Calls this app's own
// /api/marketing/* proxy routes (never the backend directly) so the admin
// session + CSRF checks apply.

import type { AgentId, CampaignTrack } from "./agents-ui";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function askAgent(agentId: AgentId, messages: ChatMessage[]): Promise<string> {
  const res = await fetch("/api/marketing/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, messages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Agent request failed.");
  return data.text as string;
}

export interface GeneratedAd {
  dataUrl: string;
  prompt: string;
  provider: string;
}

export async function generateAd(request: string, size?: string): Promise<GeneratedAd> {
  const res = await fetch("/api/marketing/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request, size }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Image generation failed.");
  return data as GeneratedAd;
}

export interface CampaignEvent {
  type: "step_start" | "step_done" | "complete" | "error";
  index?: number;
  agentId?: AgentId;
  name?: string;
  text?: string;
  message?: string;
}

/** Streams a chained campaign for the given track ("mentor" | "mentee"). */
export async function runCampaign(track: CampaignTrack, onEvent: (e: CampaignEvent) => void): Promise<void> {
  const res = await fetch("/api/marketing/campaign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ track }),
  });
  if (!res.body) throw new Error("No response stream.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      try {
        onEvent(JSON.parse(line.slice(5).trim()) as CampaignEvent);
      } catch {
        /* ignore keep-alive */
      }
    }
  }
}
