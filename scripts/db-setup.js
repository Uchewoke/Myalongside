#!/usr/bin/env node

/**
 * Quick database setup helper
 * Usage: npm run db:setup
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = process.cwd();
const envPath = path.join(root, ".env");

function parseEnv(text) {
  const env = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const eq = line.indexOf("=");
    if (eq <= 0) {
      continue;
    }

    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    env[key] = value;
  }

  return env;
}

console.log("🗄️  MyAlongside Database Setup Helper\n");

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log("⚠️  .env file not found.\n");
  console.log("Quick setup:");
  console.log("  1. cp .env.local.example .env");
  console.log("  2. Edit .env and set DATABASE_URL to your local Postgres URL");
  console.log("  3. npm run db:setup\n");
  process.exit(0);
}

// Check database connection
console.log("📋 Checking .env...");
const env = fs.readFileSync(envPath, "utf8");
const dbMatch = env.match(/^DATABASE_URL=(.+)$/m);

if (!dbMatch) {
  console.error("❌ DATABASE_URL not set in .env");
  process.exit(1);
}

console.log("✓ DATABASE_URL configured\n");

const parsedEnv = parseEnv(env);
const cmdEnv = {
  ...process.env,
  DATABASE_URL: parsedEnv.DATABASE_URL,
};

if (parsedEnv.NODE_ENV) {
  cmdEnv.NODE_ENV = parsedEnv.NODE_ENV;
}

// Run migrations
console.log("🚀 Running migrations...");
try {
  execSync("npm run prisma:migrate:dev -- --name init", {
    cwd: path.join(root, "backend"),
    stdio: "inherit",
    env: cmdEnv,
  });
} catch (e) {
  console.error("Migration failed. Check your DATABASE_URL.");
  process.exit(1);
}

// Seed data
console.log("\n🌱 Seeding initial data...");
try {
  execSync("npm run prisma:seed", {
    cwd: path.join(root, "backend"),
    stdio: "inherit",
    env: cmdEnv,
  });
} catch (e) {
  console.error("Seeding failed.");
  process.exit(1);
}

console.log("\n✅ Database setup complete!\n");
console.log("Next steps:");
console.log("  npm run dev:backend       # Start API");
console.log("  npm run dev:web           # Start frontend");
console.log("  npm run prisma:studio     # Browse database\n");
