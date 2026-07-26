import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const createSchema = z.object({
  mentorId: z.string().cuid(),
  lifeEventSlug: z.string().optional(),
  note: z.string().max(500).optional(),
});

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "DECLINED"]),
});

export async function createMatch(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const seekerId = req.auth!.sub;
  const { mentorId, lifeEventSlug, note } = parsed.data;

  if (seekerId === mentorId) {
    res.status(400).json({ error: "Cannot match with yourself." });
    return;
  }

  const mentor = await prisma.user.findFirst({
    where: { id: mentorId, role: "MENTOR", isBanned: false },
  });
  if (!mentor) {
    res.status(404).json({ error: "Mentor not found." });
    return;
  }

  const existing = await prisma.match.findUnique({
    where: { seekerId_mentorId: { seekerId, mentorId } },
    include: { conversation: true },
  });
  if (existing) {
    res.status(409).json({ error: "Match already exists.", match: existing });
    return;
  }

  let lifeEventId: string | undefined;
  if (lifeEventSlug) {
    const le = await prisma.lifeEvent.findUnique({ where: { slug: lifeEventSlug } });
    if (le) lifeEventId = le.id;
  }

  const match = await prisma.match.create({
    data: {
      seekerId,
      mentorId,
      lifeEventId,
      initiatorNote: note,
      conversation: { create: {} },
    },
    include: { conversation: true },
  });

  res.status(201).json(match);
}

export async function listMyMatches(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.auth!.sub;
  const role = req.auth!.role;

  const matches = await prisma.match.findMany({
    where:
      role === "MENTOR"
        ? { mentorId: userId }
        : { seekerId: userId },
    include: {
      seeker: { select: { id: true, name: true, avatar: true } },
      mentor: {
        select: {
          id: true,
          name: true,
          avatar: true,
          mentorProfile: { select: { tagline: true, rating: true, isAvailable: true } },
        },
      },
      conversation: {
        select: {
          id: true,
          updatedAt: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, type: true, createdAt: true, senderId: true },
          },
          _count: {
            select: {
              messages: { where: { senderId: { not: userId }, readAt: null } },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Match only stores the lifeEventId scalar (no declared relation), so
  // resolve labels with a small batch lookup instead of a schema change.
  const lifeEventIds = [...new Set(matches.map((m: any) => m.lifeEventId).filter(Boolean))];
  const lifeEvents = lifeEventIds.length
    ? await prisma.lifeEvent.findMany({
        where: { id: { in: lifeEventIds as string[] } },
        select: { id: true, slug: true, label: true, emoji: true },
      })
    : [];
  const lifeEventById = new Map(lifeEvents.map((e: any) => [e.id, e]));

  const result = matches.map((match: any) => ({
    ...match,
    lifeEvent: match.lifeEventId ? lifeEventById.get(match.lifeEventId) ?? null : null,
  }));

  res.json(result);
}

export async function updateMatchStatus(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userId = req.auth!.sub;
  const match = await prisma.match.findUnique({ where: { id } });

  if (!match) {
    res.status(404).json({ error: "Match not found." });
    return;
  }

  if (match.seekerId !== userId && match.mentorId !== userId) {
    res.status(403).json({ error: "Not your match." });
    return;
  }

  const updated = await prisma.match.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  res.json(updated);
}
