import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { isAdminAuthed } from "@/lib/auth";
import { addImage } from "@/lib/images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const caption = form.get("caption");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
  }
  if (typeof caption !== "string" || caption.trim().length === 0) {
    return NextResponse.json({ error: "Caption is required" }, { status: 400 });
  }

  const id = randomUUID();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";

  const blob = await put(`gallery/${id}.${extension}`, file, {
    access: "public", // URL is unguessable and never exposed to clients
    contentType: file.type,
  });

  await addImage({
    id,
    url: blob.url,
    caption: caption.trim().slice(0, 200),
    contentType: file.type,
    uploadedAt: Date.now(),
  });

  return NextResponse.json({ ok: true, id });
}
