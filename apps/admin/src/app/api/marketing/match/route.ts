import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/** GET /api/marketing/match?event=divorce[&limit=5] — ranked mentor suggestions. */
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const event = req.nextUrl.searchParams.get("event");
  if (!event) {
    return NextResponse.json({ error: "event query param is required." }, { status: 400 });
  }
  const limit = req.nextUrl.searchParams.get("limit");
  const query = new URLSearchParams({ event, ...(limit ? { limit } : {}) });

  const res = await fetch(`${backendUrl}/api/marketing/match?${query.toString()}`, {
    headers: { Authorization: `Bearer ${session.token}` },
    cache: "no-store",
  });
  const payload = await res.json().catch(() => ({ error: "Lookup failed." }));
  return NextResponse.json(payload, { status: res.status });
}
