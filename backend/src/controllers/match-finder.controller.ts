import { Request, Response } from "express";
import { z } from "zod";
import { suggestMentors, upsertMentee } from "../services/matching.service";

const searchSchema = z.object({
  event: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

const menteeSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  lifeEvent: z.string().trim().min(1).max(200),
  story: z.string().trim().max(4000).optional(),
});

/** GET /api/marketing/match?event=divorce[&limit=5] — ranked mentor suggestions. [admin] */
export async function getMentorMatches(req: Request, res: Response): Promise<void> {
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const result = await suggestMentors(parsed.data.event, parsed.data.limit);
  res.json(result);
}

/** POST /api/marketing/mentees — save mentee + return mentor suggestions. [admin] */
export async function captureMentee(req: Request, res: Response): Promise<void> {
  const parsed = menteeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { story, ...rest } = parsed.data;
  const mentee = await upsertMentee({ ...rest, story: story ?? "" });
  const suggestions = await suggestMentors(rest.lifeEvent);
  res.status(201).json({ mentee, ...suggestions });
}
