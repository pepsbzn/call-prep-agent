import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { listImagesInFolder, downloadFile } from "./googleDrive";
import { addImage } from "./images";

const IMPORTED_KEY = "drive:imported"; // set of Drive file IDs already imported
const MAX_PER_RUN = 5; // keep each invocation well under the function's time limit

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function captionFromFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  const cleaned = base.replace(/[_-]+/g, " ").trim();
  return cleaned || "Untitled";
}

export interface SyncResult {
  imported: string[]; // captions of newly imported files
  remaining: number; // new files not yet processed (next run picks these up)
  errors: string[];
}

// Drop a photo in the connected Drive folder and this pulls it in: list the
// folder, skip anything already imported (tracked by Drive file id in KV),
// download and store the rest exactly like a manual /upload.
export async function syncDriveFolder(): Promise<SyncResult> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is not set");
  }

  const files = await listImagesInFolder(folderId);
  const alreadyImported = new Set(await kv.smembers(IMPORTED_KEY));
  const newFiles = files.filter((f) => !alreadyImported.has(f.id));
  const toImport = newFiles.slice(0, MAX_PER_RUN);

  const imported: string[] = [];
  const errors: string[] = [];

  for (const file of toImport) {
    try {
      const bytes = await downloadFile(file.id);
      const id = randomUUID();
      const extension = EXTENSION_BY_MIME[file.mimeType] ?? "jpg";
      const blob = await put(`gallery/${id}.${extension}`, bytes, {
        access: "public", // URL is unguessable and never exposed to clients
        contentType: file.mimeType,
      });
      const caption = captionFromFilename(file.name);
      await addImage({
        id,
        url: blob.url,
        caption,
        contentType: file.mimeType,
        uploadedAt: Date.now(),
      });
      await kv.sadd(IMPORTED_KEY, file.id);
      imported.push(caption);
    } catch (err) {
      errors.push(`${file.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { imported, remaining: newFiles.length - toImport.length, errors };
}
