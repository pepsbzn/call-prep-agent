import { NextRequest, NextResponse } from "next/server";
import { isSiteAuthed } from "@/lib/auth";
import { addEntry } from "@/lib/guestbook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isSiteAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let name = "";
  let message = "";
  try {
    const body = await request.json();
    name = typeof body?.name === "string" ? body.name.trim() : "";
    message = typeof body?.message === "string" ? body.message.trim() : "";
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!name || !message) {
    return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
  }

  await addEntry({
    name: name.slice(0, 60),
    message: message.slice(0, 1000),
    timestamp: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
