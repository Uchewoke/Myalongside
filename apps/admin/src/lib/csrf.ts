import "server-only";

import { NextResponse } from "next/server";

/**
 * CSRF defense for state-changing admin API routes.
 *
 * These endpoints are JSON `fetch` POSTs, so a browser cannot forge them
 * cross-site *and read* the response (CORS blocks that). The residual risks are
 * blind cross-site POSTs — login-CSRF (logging a victim into an attacker's
 * account) and forged mutations. Verifying the Origin header against an
 * allowlist neutralises both: a cross-site page cannot spoof Origin.
 *
 * Call at the top of every mutating route handler:
 *
 *   const csrf = assertSameOrigin(req);
 *   if (csrf) return csrf;
 */

function allowedHosts(req: Request): Set<string> {
  const hosts = new Set<string>();

  // The app's own host — covers same-origin requests in every environment
  // without needing env config.
  const host = req.headers.get("host");
  if (host) hosts.add(host.toLowerCase());

  // Explicit allowlist for reverse-proxied / multi-domain setups.
  for (const envVar of [
    process.env.ADMIN_URL,
    process.env.NEXT_PUBLIC_ADMIN_URL,
  ]) {
    if (!envVar) continue;
    try {
      hosts.add(new URL(envVar).host.toLowerCase());
    } catch {
      /* ignore malformed env value */
    }
  }

  return hosts;
}

export function assertSameOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get("origin");

  // State-changing requests from a browser always carry an Origin header.
  // A missing Origin on a POST is treated as untrusted.
  if (!origin) {
    return NextResponse.json(
      { error: "Missing Origin header." },
      { status: 403 }
    );
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return NextResponse.json(
      { error: "Invalid Origin header." },
      { status: 403 }
    );
  }

  if (!allowedHosts(req).has(originHost)) {
    return NextResponse.json(
      { error: "Cross-origin request rejected." },
      { status: 403 }
    );
  }

  return null;
}
