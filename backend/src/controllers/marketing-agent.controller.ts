import { Request, Response } from "express";
import { z } from "zod";
import { AGENTS, AgentId, CAMPAIGN_TRACKS, CampaignTrack, systemFor } from "../lib/agents";
import { runAgent } from "../lib/anthropic";
import { generateImage, ImageSize } from "../lib/imagegen";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(8000),
});

const chatSchema = z.object({
  agentId: z.custom<AgentId>((v) => typeof v === "string" && v in AGENTS),
  messages: z.array(messageSchema).min(1).max(50),
});

const imageSchema = z.object({
  request: z.string().trim().min(1).max(2000),
  size: z.enum(["1024x1024", "1024x1536", "1536x1024"]).optional(),
  skipPromptRewrite: z.boolean().optional(),
});

const campaignSchema = z.object({
  track: z.enum(["mentor", "mentee"]).default("mentor"),
});

/** POST /api/marketing/agent — one chat turn with a marketing agent. [admin] */
export async function chatWithAgent(req: Request, res: Response): Promise<void> {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const text = await runAgent({
      system: systemFor(parsed.data.agentId),
      messages: parsed.data.messages,
      maxTokens: 1600,
    });
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unexpected error." });
  }
}

/** POST /api/marketing/generate-image — Claude writes an ad prompt, an image model renders it. [admin] */
export async function generateAdImage(req: Request, res: Response): Promise<void> {
  const parsed = imageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { request, size = "1024x1024" as ImageSize, skipPromptRewrite } = parsed.data;
  try {
    let prompt = request;
    if (!skipPromptRewrite) {
      prompt = await runAgent({ system: systemFor("designer"), messages: [{ role: "user", content: request }], maxTokens: 400 });
    }
    const image = await generateImage(prompt, size);
    res.json({ dataUrl: image.dataUrl, prompt: image.prompt, provider: image.provider });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unexpected error." });
  }
}

/**
 * POST /api/marketing/campaign — SSE stream of a chained campaign. [admin]
 * Each agent runs in sequence and receives the accumulated team output so far,
 * so the track reads as one coordinated campaign.
 */
export async function streamCampaign(req: Request, res: Response): Promise<void> {
  const parsed = campaignSchema.safeParse(req.body ?? {});
  const selected: CampaignTrack = parsed.success ? parsed.data.track : "mentor";
  const steps = CAMPAIGN_TRACKS[selected].steps;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  const send = (obj: unknown) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  let transcript = "";
  try {
    for (let i = 0; i < steps.length; i++) {
      const { id, brief } = steps[i];
      send({ type: "step_start", index: i, agentId: id, name: AGENTS[id].name });

      const prompt = transcript
        ? `TEAM WORK SO FAR (build on this, stay consistent):\n\n${transcript}\n\n---\nYOUR TASK: ${brief}`
        : brief;

      let text = "";
      try {
        text = await runAgent({ system: systemFor(id), messages: [{ role: "user", content: prompt }], maxTokens: 1200 });
      } catch (e) {
        text = `Failed to generate: ${e instanceof Error ? e.message : "error"}`;
      }

      transcript += `\n\n### ${AGENTS[id].name}\n${text}`;
      send({ type: "step_done", index: i, agentId: id, name: AGENTS[id].name, text });
    }
    send({ type: "complete" });
  } catch (e) {
    send({ type: "error", message: e instanceof Error ? e.message : "error" });
  } finally {
    res.end();
  }
}
