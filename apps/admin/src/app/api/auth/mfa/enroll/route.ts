import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/csrf";

const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.setupToken !== "string") {
    return NextResponse.json({ error: "Missing MFA setup token." }, { status: 400 });
  }

  // The setup ticket (not a session) scopes this call to enrollment only — see mfa.middleware.ts.
  const enrollResponse = await fetch(`${backendUrl}/api/auth/mfa/enroll`, {
    method: "POST",
    headers: { "x-mfa-setup-token": body.setupToken },
    cache: "no-store",
  });

  const payload = await enrollResponse.json().catch(() => ({ error: "Unable to start MFA enrollment." }));
  return NextResponse.json(payload, { status: enrollResponse.status });
}
