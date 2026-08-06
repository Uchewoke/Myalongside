// Server-side verification for Cloudflare Turnstile (CAPTCHA) tokens.
// Protects the public mentor-lead capture endpoint from bots.
//
// Env:
//   TURNSTILE_SECRET_KEY - secret key from the Cloudflare dashboard.
//
// If unset, verification is skipped (returns true) so local dev works without
// CAPTCHA. Set it in production to enforce.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string | undefined, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured -> skip (dev)
  if (!token) return false;

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
