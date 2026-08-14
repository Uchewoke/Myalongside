import dns from "dns";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// See backend/src/lib/prisma.ts for why this is needed.
dns.setDefaultResultOrder("ipv4first");

const prisma = new PrismaClient();

const LIFE_EVENTS = [
  {
    slug: "divorce",
    label: "Divorce",
    emoji: "💔",
    category: "Relationships",
    description: "Navigating the complexities of divorce and co-parenting",
  },
  {
    slug: "grief",
    label: "Grief",
    emoji: "🕯️",
    category: "Loss",
    description: "Processing loss of a loved one",
  },
  {
    slug: "job-loss",
    label: "Job Loss",
    emoji: "💼",
    category: "Career",
    description: "Recovering from job loss or career transition",
  },
  {
    slug: "health-crisis",
    label: "Health Crisis",
    emoji: "🏥",
    category: "Health",
    description: "Coping with serious illness or health diagnosis",
  },
  {
    slug: "addiction-recovery",
    label: "Addiction Recovery",
    emoji: "🌱",
    category: "Wellness",
    description: "Supporting recovery from substance abuse or addiction",
  },
  {
    slug: "bankruptcy",
    label: "Bankruptcy",
    emoji: "📉",
    category: "Finance",
    description: "Rebuilding after financial hardship",
  },
  {
    slug: "empty-nest",
    label: "Empty Nest",
    emoji: "🏠",
    category: "Life Stage",
    description: "Adjusting to children moving out or growing up",
  },
  {
    slug: "career-change",
    label: "Career Change",
    emoji: "🚀",
    category: "Career",
    description: "Transitioning to a new career path",
  },
  {
    slug: "relationship-breakup",
    label: "Relationship Breakup",
    emoji: "💔",
    category: "Relationships",
    description: "Healing from a significant relationship ending",
  },
  {
    slug: "parenting-challenges",
    label: "Parenting Challenges",
    emoji: "👨‍👩‍👧‍👦",
    category: "Family",
    description: "Support for challenging parenting situations",
  },
  {
    slug: "retirement",
    label: "Retirement",
    emoji: "🎯",
    category: "Life Stage",
    description: "Adjusting to retirement and finding new purpose",
  },
  {
    slug: "relocation",
    label: "Relocation",
    emoji: "🏘️",
    category: "Life Change",
    description: "Adapting to moving to a new place",
  },
];

async function main() {
  console.log("Seeding database...");

  // Seed LifeEvents
  console.log("Creating life events...");
  for (const event of LIFE_EVENTS) {
    await prisma.lifeEvent.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    });
  }
  console.log("✓ Created %d life events", LIFE_EVENTS.length);

  // Optionally seed test users (comment out for production)
  console.log("\nCreating test users...");

  const hashedPassword = await bcrypt.hash("testpassword123", 10);

  // Test seeker
  const seeker = await prisma.user.upsert({
    where: { email: "seeker@test.local" },
    update: {},
    create: {
      email: "seeker@test.local",
      passwordHash: hashedPassword,
      name: "Jordan Test",
      role: "SEEKER",
      bio: "Looking for guidance through job loss",
      isVerified: true,
      emailConfirmed: true,
      userLifeEvents: {
        create: {
          lifeEventId: (
            await prisma.lifeEvent.findUnique({
              where: { slug: "job-loss" },
            })
          )!.id,
          status: "GOING_THROUGH",
        },
      },
    },
  });

  // Test mentor
  const mentor = await prisma.user.upsert({
    where: { email: "mentor@test.local" },
    update: {},
    create: {
      email: "mentor@test.local",
      passwordHash: hashedPassword,
      name: "Sarah Mentor",
      role: "MENTOR",
      bio: "10+ years recovered from job loss. Now running my own business.",
      isVerified: true,
      emailConfirmed: true,
      mentorProfile: {
        create: {
          tagline: "Career recovery specialist",
          yearsExperience: 10,
          isAvailable: true,
          rating: 4.9,
          reviewCount: 42,
          maxSeekers: 5,
        },
      },
      userLifeEvents: {
        create: {
          lifeEventId: (
            await prisma.lifeEvent.findUnique({
              where: { slug: "job-loss" },
            })
          )!.id,
          status: "SURVIVED",
        },
      },
    },
  });

  console.log("✓ Created test users");
  console.log("  - Seeker: seeker@test.local / testpassword123");
  console.log("  - Mentor: mentor@test.local / testpassword123");

  console.log("\n✅ Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
