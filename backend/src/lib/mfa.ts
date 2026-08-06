/**
 * TOTP (RFC 6238) second factor, implemented on Node's built-in `crypto` so no
 * third-party secret-handling library is in the dependency tree.
 *
 * Secrets are base32, 20 bytes of CSPRNG output. Codes are 6 digits, 30s step,
 * verified against a +/-1 step window to tolerate clock drift.
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

const STEP_SECONDS = 30;
const DIGITS = 6;
const WINDOW = 1; // accept the previous/next step too

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** Generates a new random base32 TOTP secret. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

function totpAt(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binCode % 10 ** DIGITS).padStart(DIGITS, "0");
}

/** Verifies a user-submitted 6-digit code against the secret, tolerating clock drift. */
export function verifyTotp(secret: string, token: string): boolean {
  if (!/^\d{6}$/.test(token)) return false;
  const counter = Math.floor(Date.now() / 1000 / STEP_SECONDS);

  for (let errorWindow = -WINDOW; errorWindow <= WINDOW; errorWindow++) {
    const candidate = totpAt(secret, counter + errorWindow);
    if (
      timingSafeEqual(Buffer.from(candidate), Buffer.from(token))
    ) {
      return true;
    }
  }
  return false;
}

/** otpauth:// URL for QR-code enrollment in an authenticator app. */
export function buildOtpAuthUrl(email: string, secret: string): string {
  const label = encodeURIComponent(`MyAlongside:${email}`);
  const issuer = encodeURIComponent("MyAlongside");
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

const BACKUP_CODE_COUNT = 10;

/** Generates one-time backup codes; returns plaintext (show once) + bcrypt hashes (store). */
export async function generateBackupCodes(): Promise<{ plaintext: string[]; hashes: string[] }> {
  const plaintext = Array.from({ length: BACKUP_CODE_COUNT }, () =>
    randomBytes(5).toString("hex")
  );
  const hashes = await Promise.all(plaintext.map((code) => bcrypt.hash(code, 10)));
  return { plaintext, hashes };
}

/** Consumes a backup code if valid; returns the remaining hash list (code removed) or null if no match. */
export async function consumeBackupCode(
  hashes: string[],
  submitted: string
): Promise<string[] | null> {
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(submitted, hashes[i])) {
      return [...hashes.slice(0, i), ...hashes.slice(i + 1)];
    }
  }
  return null;
}
