import dns from "dns";
import { PrismaClient } from "@prisma/client";
import { LIFE_EVENTS } from "./lifeEvents";

// See backend/src/lib/prisma.ts for why this is needed.
dns.setDefaultResultOrder("ipv4first");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding life events...");
  for (const event of LIFE_EVENTS) {
    await prisma.lifeEvent.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    });
  }
  console.log("✓ Created %d life events", LIFE_EVENTS.length);
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
