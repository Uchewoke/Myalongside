import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { assertSameOrigin } from "@/lib/csrf";

const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/** PATCH /api/marketing/leads/:id — status override; converts to a mentor account on approval. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.status !== "string") {
    return NextResponse.json({ error: "status is required." }, { status: 400 });
  }

  const res = await fetch(`${backendUrl}/api/marketing/mentor-leads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
    body: JSON.stringify({ status: body.status }),
    cache: "no-store",
  });
  const payload = await res.json().catch(() => ({ error: "Unable to update lead." }));
  return NextResponse.json(payload, { status: res.status });
}
