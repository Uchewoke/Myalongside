import path from "path";
import dns from "dns";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { LIFE_EVENTS } from "./lifeEvents";

// Mirrors backend/src/index.ts: load backend/.env first, then fallback to
// root/.env for monorepo runs. Needed because ts-node scripts (unlike the
// `prisma` CLI) don't auto-load .env themselves.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env"), override: false });

// See backend/src/lib/prisma.ts for why this is needed.
dns.setDefaultResultOrder("ipv4first");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding life events...");
  for (const event of LIFE_EVENTS) {
    await prisma.lifeEvent.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
  }
  console.log("✓ Upserted %d life events", LIFE_EVENTS.length);

  const currentSlugs = LIFE_EVENTS.map((e) => e.slug);
  const { count } = await prisma.lifeEvent.deleteMany({
    where: { slug: { notIn: currentSlugs } },
  });
  if (count > 0) {
    console.log("✓ Removed %d stale life event(s) no longer in the canonical list", count);
  }
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
