import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/** GET /api/marketing/leads[?status=QUALIFIED] — proxies to the backend, admin-session gated. */
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status");
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  const res = await fetch(`${backendUrl}/api/marketing/mentor-leads${query}`, {
    headers: { Authorization: `Bearer ${session.token}` },
    cache: "no-store",
  });
  const payload = await res.json().catch(() => ({ error: "Unable to load leads." }));
  return NextResponse.json(payload, { status: res.status });
}
