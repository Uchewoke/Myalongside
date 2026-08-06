import { Request, Response } from "express";
import { z } from "zod";
import { LeadStatus } from "@prisma/client";
import { verifyTurnstile } from "../lib/turnstile";
import { writeAuditLog, reqMeta } from "../lib/audit";
import { AuthRequest } from "../middleware/auth.middleware";
import { captureLead, listLeads, updateLeadStatus } from "../services/mentor-leads.service";

const captureSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  lifeEvent: z.string().trim().min(1).max(200),
  story: z.string().trim().min(1).max(4000),
  availability: z.string().trim().max(200).optional(),
  turnstileToken: z.string().optional(),
});

const listSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
});

const statusUpdateSchema = z.object({
  status: z.nativeEnum(LeadStatus),
});

/** POST /api/marketing/mentor-leads — public capture + AI qualification. */
export async function captureMentorLead(req: Request, res: Response): Promise<void> {
  const parsed = captureSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const { turnstileToken, ...input } = parsed.data;
  const captchaOk = await verifyTurnstile(turnstileToken, req.ip);
  if (!captchaOk) {
    res.status(400).json({ error: "Captcha verification failed." });
    return;
  }

  try {
    const lead = await captureLead(input);
    await writeAuditLog({ action: "MENTOR_LEAD_CAPTURED", resource: "MentorLead", resourceId: lead.id, ...reqMeta(req) });
    res.status(201).json({ lead });
  } catch (error) {
    console.error("Error capturing mentor lead:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

/** GET /api/marketing/mentor-leads — admin list, optional ?status filter. */
export async function listMentorLeads(req: Request, res: Response): Promise<void> {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const leads = await listLeads(parsed.data.status);
  res.json({ leads });
}

/** PATCH /api/marketing/mentor-leads/:id — admin status override (auto-converts on approval). */
export async function updateMentorLead(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const parsed = statusUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const lead = await updateLeadStatus(id, parsed.data.status);
  if (!lead) {
    res.status(404).json({ error: "Lead not found." });
    return;
  }

  await writeAuditLog({
    userId: req.auth?.sub,
    action: "MENTOR_LEAD_STATUS_UPDATE",
    resource: "MentorLead",
    resourceId: lead.id,
    metadata: { status: lead.status },
    ...reqMeta(req),
  });
  if (lead.convertedUserId) {
    await writeAuditLog({
      userId: req.auth?.sub,
      action: "MENTOR_LEAD_CONVERTED",
      resource: "User",
      resourceId: lead.convertedUserId,
      metadata: { leadId: lead.id },
      ...reqMeta(req),
    });
  }

  res.json({ lead });
}
