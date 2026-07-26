import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const sendSchema = z.object({
  content: z.string().min(1).max(4000),
  type: z.enum(["TEXT", "SYSTEM"]).optional(),
});

export async function getConversation(req: AuthRequest, res: Response): Promise<void> {
  const { conversationId } = req.params as { conversationId: string };
  const userId = req.auth!.sub;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      match: {
        select: {
          seekerId: true,
          mentorId: true,
          status: true,
          seeker: { select: { id: true, name: true, avatar: true } },
          mentor: {
            select: {
              id: true,
              name: true,
              avatar: true,
              mentorProfile: { select: { tagline: true, isAvailable: true } },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 100,
        select: {
          id: true,
          content: true,
          type: true,
          readAt: true,
          createdAt: true,
          sender: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found." });
    return;
  }

  const { seekerId, mentorId } = conversation.match;
  if (userId !== seekerId && userId !== mentorId) {
    res.status(403).json({ error: "Not your conversation." });
    return;
  }

  // Mark unread messages as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  res.json(conversation);
}

export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
  const { conversationId } = req.params as { conversationId: string };
  const userId = req.auth!.sub;

  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { match: { select: { seekerId: true, mentorId: true, status: true } } },
  });

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found." });
    return;
  }

  const { seekerId, mentorId, status } = conversation.match;
  if (userId !== seekerId && userId !== mentorId) {
    res.status(403).json({ error: "Not your conversation." });
    return;
  }

  if (status === "COMPLETED" || status === "DECLINED") {
    res.status(400).json({ error: "Cannot send messages to an inactive match." });
    return;
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content: parsed.data.content,
      type: parsed.data.type ?? "TEXT",
    },
    select: {
      id: true,
      content: true,
      type: true,
      readAt: true,
      createdAt: true,
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  // Bump conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  res.status(201).json(message);
}
