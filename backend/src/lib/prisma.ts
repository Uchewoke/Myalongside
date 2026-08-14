import dns from "dns";
import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Some networks advertise IPv6 without actually routing it, which makes
// Node's default (IPv6-first) DNS resolution hang for tens of seconds before
// falling back to IPv4 — surfacing as a Prisma P1001 "can't reach database
// server". Preferring IPv4 avoids that stall.
dns.setDefaultResultOrder("ipv4first");

// Ensure Prisma always sees DATABASE_URL in monorepo runs.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env"), override: false });

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
