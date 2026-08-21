import dns from "dns";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { LIFE_EVENTS } from "./lifeEvents";

// See backend/src/lib/prisma.ts for why this is needed.
dns.setDefaultResultOrder("ipv4first");

const prisma = new PrismaClient();

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
