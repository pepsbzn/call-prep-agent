import { NextResponse } from "next/server";
import { listImages } from "@/lib/images";
import { blurImage } from "@/lib/blur";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Homepage teaser: a random gallery image, always blurred, rotating on
// every page load. Returns a 1x1 transparent GIF when the gallery is empty
// so the homepage never breaks.
const EMPTY_GIF = new Uint8Array(
  Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64")
);

export async function GET() {
  const images = await listImages().catch(() => []);
  if (images.length === 0) {
    return new NextResponse(EMPTY_GIF, {
      headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
    });
  }

  const pick = images[Math.floor(Math.random() * images.length)];
  const upstream = await fetch(pick.url);
  if (!upstream.ok) {
    return new NextResponse(EMPTY_GIF, {
      headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
    });
  }

  const blurred = await blurImage(Buffer.from(await upstream.arrayBuffer()));
  return new NextResponse(new Uint8Array(blurred), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" },
  });
}
