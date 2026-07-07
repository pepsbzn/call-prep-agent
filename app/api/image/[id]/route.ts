import { NextRequest, NextResponse } from "next/server";
import { isSiteAuthed } from "@/lib/auth";
import { getImage } from "@/lib/images";
import { blurImage } from "@/lib/blur";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// All gallery images are served through this proxy. Blob URLs stay
// server-side, and unauthenticated requests only ever receive a tiny
// pre-blurred JPEG — full-resolution bytes never leave the server without
// a valid auth cookie, so the blur cannot be stripped in devtools.
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const meta = await getImage(params.id);
  if (!meta) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const upstream = await fetch(meta.url);
  if (!upstream.ok) {
    return NextResponse.json({ error: "Image unavailable" }, { status: 502 });
  }
  const original = Buffer.from(await upstream.arrayBuffer());

  if (isSiteAuthed()) {
    return new NextResponse(new Uint8Array(original), {
      headers: {
        "Content-Type": meta.contentType || "image/jpeg",
        "Cache-Control": "private, no-store",
      },
    });
  }

  const blurred = await blurImage(original);
  return new NextResponse(new Uint8Array(blurred), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, no-store",
    },
  });
}
