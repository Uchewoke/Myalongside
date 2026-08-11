import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { writeAuditLog, reqMeta } from "../lib/audit";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set.`);
  return value;
}

const JWT_SECRET = requireEnv("JWT_SECRET");
const REFRESH_SECRET = requireEnv("JWT_REFRESH_SECRET");
const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// ── Validation schemas ─────────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["SEEKER", "MENTOR"]).optional().default("SEEKER"),
  lifeEventSlugs: z.array(z.string()).optional().default([]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const seekerSettingsSchema = z.object({
  introVisibility: z.enum(["matched-only", "all-verified-mentors"]).optional(),
  allowMentorSuggestions: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  crisisCheckins: z.boolean().optional(),
});

const mentorSettingsSchema = z.object({
  availableForNewSeekers: z.boolean().optional(),
  maxActiveSeekers: z.number().int().min(1).max(40).optional(),
  mentoringFocus: z.string().max(240).optional(),
  showResponseTemplates: z.boolean().optional(),
  weeklyInsights: z.boolean().optional(),
});

const generalSettingsSchema = z.object({
  anonymousMode: z.boolean().optional(),
  displayNameMode: z.enum(["full-name", "first-name-only", "anonymous"]).optional(),
  allowCommunityProfile: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  matchNotifications: z.boolean().optional(),
  messageNotifications: z.boolean().optional(),
  productAnnouncements: z.boolean().optional(),
});

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().max(500).optional().or(z.literal("")),
  bio: z.string().max(1500).optional(),
  location: z.string().max(120).optional(),
  languages: z.array(z.string().min(1).max(40)).max(10).optional(),
  settings: z
    .object({
      general: generalSettingsSchema.optional(),
      seeker: seekerSettingsSchema.optional(),
      mentor: mentorSettingsSchema.optional(),
    })
    .optional(),
});

// ── Safe user projection ──────────────────────────────────────────────────────

function safeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  languages: string[];
  settings: unknown;
  subscriptionTier: string;
  stripeCustomerId: string | null;
  mentorProfile?: {
    tagline: string;
    maxSeekers: number;
    isAvailable: boolean;
  } | null;
}) {
  const currentSettings =
    user.settings && typeof user.settings === "object"
      ? (user.settings as Record<string, unknown>)
      : {};

  const seeker =
    currentSettings.seeker && typeof currentSettings.seeker === "object"
      ? (currentSettings.seeker as Record<string, unknown>)
      : {};

  const mentor =
    currentSettings.mentor && typeof currentSettings.mentor === "object"
      ? (currentSettings.mentor as Record<string, unknown>)
      : {};

  const general =
    currentSettings.general && typeof currentSettings.general === "object"
      ? (currentSettings.general as Record<string, unknown>)
      : {};

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    languages: user.languages,
    subscriptionTier: user.subscriptionTier,
    stripeCustomerId: user.stripeCustomerId,
    settings: {
      general: {
        anonymousMode:
          typeof general.anonymousMode === "boolean" ? general.anonymousMode : false,
        displayNameMode:
          general.displayNameMode === "first-name-only" ||
          general.displayNameMode === "anonymous"
            ? general.displayNameMode
            : "full-name",
        allowCommunityProfile:
          typeof general.allowCommunityProfile === "boolean"
            ? general.allowCommunityProfile
            : true,
        emailNotifications:
          typeof general.emailNotifications === "boolean"
            ? general.emailNotifications
            : true,
        matchNotifications:
          typeof general.matchNotifications === "boolean"
            ? general.matchNotifications
            : true,
        messageNotifications:
          typeof general.messageNotifications === "boolean"
            ? general.messageNotifications
            : true,
        productAnnouncements:
          typeof general.productAnnouncements === "boolean"
            ? general.productAnnouncements
            : false,
      },
      seeker: {
        introVisibility:
          seeker.introVisibility === "all-verified-mentors"
            ? "all-verified-mentors"
            : "matched-only",
        allowMentorSuggestions:
          typeof seeker.allowMentorSuggestions === "boolean"
            ? seeker.allowMentorSuggestions
            : true,
        weeklyDigest:
          typeof seeker.weeklyDigest === "boolean" ? seeker.weeklyDigest : true,
        crisisCheckins:
          typeof seeker.crisisCheckins === "boolean" ? seeker.crisisCheckins : true,
      },
      mentor: {
        availableForNewSeekers:
          typeof user.mentorProfile?.isAvailable === "boolean"
            ? user.mentorProfile.isAvailable
            : typeof mentor.availableForNewSeekers === "boolean"
            ? mentor.availableForNewSeekers
            : true,
        maxActiveSeekers:
          typeof user.mentorProfile?.maxSeekers === "number"
            ? user.mentorProfile.maxSeekers
            : typeof mentor.maxActiveSeekers === "number"
            ? mentor.maxActiveSeekers
            : 8,
        mentoringFocus:
          typeof user.mentorProfile?.tagline === "string" &&
          user.mentorProfile.tagline.length > 0
            ? user.mentorProfile.tagline
            : typeof mentor.mentoringFocus === "string"
            ? mentor.mentoringFocus
            : "Career transitions and emotional resilience",
        showResponseTemplates:
          typeof mentor.showResponseTemplates === "boolean"
            ? mentor.showResponseTemplates
            : true,
        weeklyInsights:
          typeof mentor.weeklyInsights === "boolean" ? mentor.weeklyInsights : true,
      },
    },
  };
}

// ── Token helpers ─────────────────────────────────────────────────────────────

export function issueAccessToken(userId: string, role: string): string {
  const jti = randomUUID();
  return jwt.sign({ sub: userId, role, jti }, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
}

const IMPERSONATION_EXPIRY_SECONDS = 15 * 60;
const MFA_SETUP_EXPIRY = "10m";

/** Time-boxed "log in as user" token. `jti` must match the ImpersonationSession.tokenId row. */
export function issueImpersonationToken(
  targetUserId: string,
  targetRole: string,
  adminId: string,
  jti: string
): string {
  return jwt.sign(
    { sub: targetUserId, role: targetRole, jti, impersonating: true, impersonatedBy: adminId },
    JWT_SECRET,
    { expiresIn: IMPERSONATION_EXPIRY_SECONDS }
  );
}

/** Short-lived ticket scoping an unauthenticated caller to MFA enrollment only. */
export function issueMfaSetupToken(userId: string): string {
  return jwt.sign({ sub: userId, purpose: "mfa-setup" }, JWT_SECRET, { expiresIn: MFA_SETUP_EXPIRY });
}

/** Verifies an MFA setup ticket and returns the subject user id, or null. */
export function verifyMfaSetupToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (payload.purpose === "mfa-setup" && typeof payload.sub === "string") {
      return payload.sub;
    }
    return null;
  } catch {
    return null;
  }
}

function issueRefreshToken(userId: string, family: string): string {
  return jwt.sign({ sub: userId, fam: family }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });
}

async function storeRefreshToken(
  userId: string,
  rawToken: string,
  family: string
): Promise<void> {
  const tokenHash = await bcrypt.hash(rawToken, 10);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      family,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
}

/** Starts a fresh token family and issues+stores the pair — same logic login/signup use inline. */
export async function issueTokenPair(
  userId: string,
  role: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const family = randomUUID();
  const accessToken = issueAccessToken(userId, role);
  const refreshToken = issueRefreshToken(userId, family);
  await storeRefreshToken(userId, refreshToken, family);
  return { accessToken, refreshToken };
}

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  bio: true,
  location: true,
  languages: true,
  settings: true,
  subscriptionTier: true,
  stripeCustomerId: true,
  mentorProfile: {
    select: { tagline: true, maxSeekers: true, isAvailable: true },
  },
} as const;

// ── Controllers ───────────────────────────────────────────────────────────────

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }

    const { name, email, password, role, lifeEventSlugs } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        languages: [],
        userLifeEvents: {
          create: lifeEventSlugs.map((slug) => ({
            lifeEvent: { connect: { slug } },
          })),
        },
      },
      select: USER_SELECT,
    });

    const family = randomUUID();
    const accessToken = issueAccessToken(user.id, user.role);
    const rawRefresh = issueRefreshToken(user.id, family);
    await storeRefreshToken(user.id, rawRefresh, family);

    await writeAuditLog({
      userId: user.id,
      action: "SIGNUP",
      resource: "User",
      resourceId: user.id,
      ...reqMeta(req),
    });

    res.status(201).json({ user: safeUser(user), accessToken, refreshToken: rawRefresh });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid credentials." });
      return;
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        ...USER_SELECT,
        passwordHash: true,
        isBanned: true,
        deletedAt: true,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      await writeAuditLog({
        action: "LOGIN_FAILED",
        metadata: { email },
        ...reqMeta(req),
      });
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    if (user.deletedAt) {
      res.status(410).json({ error: "Account deactivated." });
      return;
    }
    if (user.isBanned) {
      res.status(403).json({ error: "Account suspended." });
      return;
    }

    // Admin accounts must authenticate through the admin console (MFA-gated,
    // server-revocable sessions) — never through the consumer JWT flow, which
    // would otherwise be a mandatory-MFA bypass.
    if (user.role === "ADMIN") {
      res.status(403).json({ error: "Admin accounts must sign in through the admin console." });
      return;
    }

    // Each login starts a fresh token family
    const family = randomUUID();
    const accessToken = issueAccessToken(user.id, user.role);
    const rawRefresh = issueRefreshToken(user.id, family);
    await storeRefreshToken(user.id, rawRefresh, family);

    await writeAuditLog({
      userId: user.id,
      action: "LOGIN",
      resource: "User",
      resourceId: user.id,
      ...reqMeta(req),
    });

    const { passwordHash: _ph, isBanned: _b, deletedAt: _d, ...publicUser } = user;
    res.json({ user: safeUser(publicUser), accessToken, refreshToken: rawRefresh });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.auth?.sub;
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: USER_SELECT });
  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  res.json({ user: safeUser(user) });
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.auth?.sub;
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const payload = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      settings: true,
      mentorProfile: {
        select: { isAvailable: true, maxSeekers: true, tagline: true },
      },
    },
  });

  if (!existing) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  const currentSettings =
    existing.settings && typeof existing.settings === "object"
      ? (existing.settings as Record<string, unknown>)
      : {};

  const mergedSettings: Record<string, unknown> = {
    ...currentSettings,
    ...(payload.settings ?? {}),
  };

  if (payload.settings?.general && typeof currentSettings.general === "object" && currentSettings.general) {
    mergedSettings.general = {
      ...(currentSettings.general as Record<string, unknown>),
      ...payload.settings.general,
    };
  }

  if (payload.settings?.seeker && typeof currentSettings.seeker === "object" && currentSettings.seeker) {
    mergedSettings.seeker = {
      ...(currentSettings.seeker as Record<string, unknown>),
      ...payload.settings.seeker,
    };
  }

  if (payload.settings?.mentor && typeof currentSettings.mentor === "object" && currentSettings.mentor) {
    mergedSettings.mentor = {
      ...(currentSettings.mentor as Record<string, unknown>),
      ...payload.settings.mentor,
    };
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: payload.name,
      avatar: payload.avatar,
      bio: payload.bio,
      location: payload.location,
      languages: payload.languages,
      settings: mergedSettings as any,
    },
    select: USER_SELECT,
  });

  if (existing.role === "MENTOR" && payload.settings?.mentor) {
    const mentorData = {
      isAvailable:
        payload.settings.mentor.availableForNewSeekers ?? existing.mentorProfile?.isAvailable ?? true,
      maxSeekers:
        payload.settings.mentor.maxActiveSeekers ?? existing.mentorProfile?.maxSeekers ?? 8,
      tagline:
        payload.settings.mentor.mentoringFocus ?? existing.mentorProfile?.tagline ?? "Mentor support",
    };

    await prisma.mentorProfile.upsert({
      where: { userId },
      update: mentorData,
      create: { userId, ...mentorData },
    });
  }

  const finalUser = await prisma.user.findUnique({ where: { id: userId }, select: USER_SELECT });

  await writeAuditLog({
    userId,
    action: "PROFILE_UPDATE",
    resource: "User",
    resourceId: userId,
    ...reqMeta(req),
  });

  res.json({ user: safeUser(finalUser ?? updated) });
}

export async function deleteProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.auth?.sub;
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, deletedAt: true },
  });

  if (!existing) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  if (existing.deletedAt) {
    res.json({ ok: true });
    return;
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.refreshToken.deleteMany({ where: { userId } });
    await tx.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  });

  await writeAuditLog({
    userId,
    action: "ACCOUNT_DELETE",
    resource: "User",
    resourceId: userId,
    ...reqMeta(req),
  });

  res.json({ ok: true });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken: token } = req.body as { refreshToken?: string };
  if (!token) {
    res.status(400).json({ error: "Refresh token required." });
    return;
  }

  // Verify JWT signature and expiry
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, REFRESH_SECRET) as jwt.JwtPayload;
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token." });
    return;
  }

  const userId = payload.sub as string;
  const family = typeof payload.fam === "string" ? payload.fam : null;

  // Fetch all non-expired tokens for this user
  const allTokens = await prisma.refreshToken.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
  });

  // Find the matching token via bcrypt comparison
  let matched: (typeof allTokens)[number] | null = null;
  for (const t of allTokens) {
    if (await bcrypt.compare(token, t.tokenHash)) {
      matched = t;
      break;
    }
  }

  if (!matched) {
    // If a family exists in the DB but the token wasn't found, this is likely
    // a stolen-token reuse attempt — invalidate the entire family.
    if (family) {
      const familyTokens = await prisma.refreshToken.findMany({
        where: { userId, family },
      });
      if (familyTokens.length > 0) {
        await prisma.refreshToken.deleteMany({ where: { userId, family } });
        await writeAuditLog({
          userId,
          action: "TOKEN_REUSE_DETECTED",
          metadata: { family },
          ...reqMeta(req),
        });
      }
    }
    res.status(401).json({ error: "Refresh token not recognised." });
    return;
  }

  // Re-verify account status before issuing new tokens
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, deletedAt: true, isBanned: true },
  });

  if (!user) {
    res.status(401).json({ error: "Account not found." });
    return;
  }
  if (user.deletedAt) {
    res.status(410).json({ error: "Account deactivated." });
    return;
  }
  if (user.isBanned) {
    res.status(403).json({ error: "Account suspended." });
    return;
  }

  // Rotate: delete used token, issue new pair in the same family
  const tokenFamily = matched.family;
  const newAccess = issueAccessToken(user.id, user.role);
  const newRaw = issueRefreshToken(user.id, tokenFamily);

  await prisma.refreshToken.delete({ where: { id: matched.id } });
  await storeRefreshToken(userId, newRaw, tokenFamily);

  await writeAuditLog({
    userId,
    action: "TOKEN_REFRESH",
    resource: "User",
    resourceId: userId,
    ...reqMeta(req),
  });

  res.json({ accessToken: newAccess, refreshToken: newRaw });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken: token } = req.body as { refreshToken?: string };
  let userId: string | undefined;

  if (token) {
    try {
      const payload = jwt.verify(token, REFRESH_SECRET) as jwt.JwtPayload;
      userId = payload.sub as string;

      const tokens = await prisma.refreshToken.findMany({ where: { userId } });
      for (const t of tokens) {
        if (await bcrypt.compare(token, t.tokenHash)) {
          await prisma.refreshToken.delete({ where: { id: t.id } });
          break;
        }
      }
    } catch {
      // Invalid token on logout is silently ignored.
    }
  }

  await writeAuditLog({
    userId,
    action: "LOGOUT",
    resource: "User",
    resourceId: userId,
    ...reqMeta(req),
  });

  res.json({ ok: true });
}
