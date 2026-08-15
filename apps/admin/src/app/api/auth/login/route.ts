import { NextResponse } from "next/server";
import { setAdminSession } from "@/lib/admin-auth";
import { assertSameOrigin } from "@/lib/csrf";

const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  // Dedicated admin-session endpoint: verifies credentials AND the ADMIN role,
  // creates a server-side revocable session, and returns an opaque token.
  // No JWT ever reaches this app's cookie.
  let loginResponse: Response;
  try {
    loginResponse = await fetch(`${backendUrl}/api/auth/admin/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        ...(typeof body.totp === "string" ? { totp: body.totp } : {}),
        ...(typeof body.backupCode === "string" ? { backupCode: body.backupCode } : {}),
      }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("Admin login: failed to reach backend at", backendUrl, err);
    return NextResponse.json({ error: "Unable to reach the server. Please try again." }, { status: 502 });
  }

  const payload = await loginResponse.json().catch(() => ({ error: "Unable to sign in." }));
  if (!loginResponse.ok) {
    return NextResponse.json(payload, { status: loginResponse.status });
  }

  if (typeof payload?.sessionToken !== "string" || payload?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  await setAdminSession(payload.sessionToken);

  return NextResponse.json({ ok: true, user: payload.user });
}
