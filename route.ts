// app/api/match/route.ts
// GET  ?event=divorce[&limit=5]                 -> ranked mentor suggestions [ADMIN]
// POST { name, email, lifeEvent, story }        -> save mentee + return suggestions [ADMIN]
//
// Both are admin operations (they expose mentor contact data), so they're covered by
// middleware.ts. If you later want mentees to self-serve matches, split the POST into
// a public, rate-limited endpoint that returns only non-identifying mentor previews.

import { NextRequest, NextResponse } from "next/server";
import { suggestMentors, upsertMentee } from "@/lib/matching";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const event = req.nextUrl.searchParams.get("event");
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 5);
    if (!event) return NextResponse.json({ error: "event query param is required." }, { status: 400 });
    const result = await suggestMentors(event, Number.isFinite(limit) ? limit : 5);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name: string; email: string; lifeEvent: string; story: string };
    if (!body?.name || !body?.email || !body?.lifeEvent) {
      return NextResponse.json({ error: "name, email, and lifeEvent are required." }, { status: 400 });
    }
    const mentee = await upsertMentee({ ...body, story: body.story ?? "" });
    const suggestions = await suggestMentors(body.lifeEvent);
    return NextResponse.json({ mentee, ...suggestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
