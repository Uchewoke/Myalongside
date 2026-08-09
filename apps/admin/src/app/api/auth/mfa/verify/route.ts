import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/csrf";

const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.setupToken !== "string" || typeof body.code !== "string") {
    return NextResponse.json({ error: "Missing MFA setup token or code." }, { status: 400 });
  }

  const verifyResponse = await fetch(`${backendUrl}/api/auth/mfa/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mfa-setup-token": body.setupToken,
    },
    body: JSON.stringify({ code: body.code }),
    cache: "no-store",
  });

  const payload = await verifyResponse.json().catch(() => ({ error: "Unable to verify MFA code." }));
  return NextResponse.json(payload, { status: verifyResponse.status });
}
