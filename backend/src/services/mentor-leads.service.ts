// Mentor-lead capture, qualification, listing, and admin status updates.
// Approving a lead (status -> QUALIFIED) auto-converts it into a real
// User + MentorProfile so recruitment output lands directly in the platform's
// mentor pool instead of a disconnected marketing table.

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { LeadStatus, MentorLead } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { qualifyLead } from "./lead-qualification.service";
import { notifyHighScoringLead } from "./notify.service";

export interface NewLeadInput {
  name: string;
  email: string;
  lifeEvent: string;
  story: string;
  availability?: string;
}

/**
 * Capture a mentor lead and score it. Upserts on email so a repeat signup
 * updates rather than errors on the unique constraint.
 */
export async function captureLead(input: NewLeadInput): Promise<MentorLead> {
  const email = input.email.trim().toLowerCase();
  const data = {
    name: input.name.trim(),
    email,
    lifeEvent: input.lifeEvent.trim(),
    story: input.story.trim(),
    availability: (input.availability ?? "").trim(),
  };

  const lead = await prisma.mentorLead.upsert({
    where: { email },
    update: data,
    create: data,
  });

  const qualification = await qualifyLead({
    name: lead.name,
    lifeEvent: lead.lifeEvent,
    story: lead.story,
    availability: lead.availability,
  });

  const scored = await prisma.mentorLead.update({
    where: { id: lead.id },
    data: {
      score: qualification.score,
      status: qualification.status,
      qualificationNotes: qualification.notes,
    },
  });

  // Fire-and-forget — a notification failure must never break signup.
  void notifyHighScoringLead(scored, qualification);

  return scored;
}

export async function listLeads(status?: LeadStatus): Promise<MentorLead[]> {
  return prisma.mentorLead.findMany({
    where: status ? { status } : undefined,
    orderBy: status ? [{ score: "desc" }, { createdAt: "desc" }] : [{ createdAt: "desc" }],
  });
}

export async function getLead(id: string): Promise<MentorLead | null> {
  return prisma.mentorLead.findUnique({ where: { id } });
}

/**
 * Create a real mentor account from an approved lead. Generates a random
 * temporary password (never exposed) — the mentor sets their own password via
 * the normal account-recovery flow before first login.
 */
async function convertLeadToMentor(lead: MentorLead): Promise<string> {
  const tempPassword = randomBytes(24).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const tagline = lead.story.length > 140 ? `${lead.story.slice(0, 137)}...` : lead.story;

  const user = await prisma.user.create({
    data: {
      name: lead.name,
      email: lead.email,
      passwordHash,
      role: "MENTOR",
      languages: [],
      mentorProfile: {
        create: {
          tagline,
          isAvailable: true,
        },
      },
    },
  });

  await prisma.mentorLead.update({
    where: { id: lead.id },
    data: { convertedUserId: user.id },
  });

  return user.id;
}

/**
 * Admin status override. Setting QUALIFIED or CONVERTED converts the lead
 * into a mentor account if one doesn't already exist for it.
 */
export async function updateLeadStatus(id: string, status: LeadStatus): Promise<MentorLead | null> {
  const existing = await prisma.mentorLead.findUnique({ where: { id } });
  if (!existing) return null;

  const shouldConvert =
    !existing.convertedUserId && (status === LeadStatus.QUALIFIED || status === LeadStatus.CONVERTED);

  if (shouldConvert) {
    const emailInUse = await prisma.user.findUnique({ where: { email: existing.email }, select: { id: true } });
    if (!emailInUse) {
      await convertLeadToMentor(existing);
    }
  }

  return prisma.mentorLead.update({
    where: { id },
    data: { status },
  });
}
