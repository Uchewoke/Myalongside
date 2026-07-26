import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin-auth";
import { assertSameOrigin } from "@/lib/csrf";

export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;

  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
