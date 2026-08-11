/**
 * Creates (or promotes) an ADMIN user directly in the database.
 *
 * Usage:
 *   npm run admin:create -- <email> <password> "<name>"
 *
 * If a user with that email already exists, it's promoted to ADMIN and its
 * password is reset to the one given. mfaEnabled is left false so the admin
 * console's enrollment flow (AdminLoginForm) kicks in on first login.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [email, password, name] = process.argv.slice(2);

  if (!email || !password || !name) {
    console.error('Usage: npm run admin:create -- <email> <password> "<name>"');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      isBanned: false,
      deletedAt: null,
    },
    create: {
      email,
      name,
      passwordHash,
      role: "ADMIN",
      isVerified: true,
      emailConfirmed: true,
    },
    select: { id: true, email: true, role: true },
  });

  console.log(`Admin user ready: ${user.email} (id: ${user.id}, role: ${user.role})`);
  console.log("MFA is not yet enabled — you'll be prompted to enroll an authenticator app on first login.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
