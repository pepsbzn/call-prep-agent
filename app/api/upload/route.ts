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

  // Fail loudly with the exact missing piece — storage misconfiguration is
  // the most common cause of a failed upload on a fresh deployment.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Blob storage is not configured: BLOB_READ_WRITE_TOKEN is missing. Connect a Blob store to this project in Vercel (Storage tab), then redeploy.",
      },
      { status: 500 }
    );
  }
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Redis/KV is not configured: KV_REST_API_URL / KV_REST_API_TOKEN are missing. Add an Upstash Redis database from the Vercel Marketplace, connect it to this project, then redeploy.",
      },
      { status: 500 }
    );
  }

  const id = randomUUID();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";

  let blobUrl: string;
  try {
    const blob = await put(`gallery/${id}.${extension}`, file, {
      access: "public", // URL is unguessable and never exposed to clients
      contentType: file.type,
    });
    blobUrl = blob.url;
  } catch (err) {
    console.error("Blob upload failed:", err);
    return NextResponse.json(
      { error: "Storing the file in Vercel Blob failed. Check the Blob store connection and redeploy." },
      { status: 500 }
    );
  }

  try {
    await addImage({
      id,
      url: blobUrl,
      caption: caption.trim().slice(0, 200),
      contentType: file.type,
      uploadedAt: Date.now(),
    });
  } catch (err) {
    console.error("KV write failed:", err);
    return NextResponse.json(
      { error: "Writing metadata to Redis/KV failed. Check the Upstash Redis connection and redeploy." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id });
}
