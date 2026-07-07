import { kv } from "@vercel/kv";

export interface ImageMeta {
  id: string;
  url: string; // Blob URL — server-side only, never sent to the client
  caption: string;
  contentType: string;
  uploadedAt: number; // epoch ms
}

const IMAGES_KEY = "images";

export async function listImages(): Promise<ImageMeta[]> {
  const raw = await kv.lrange<ImageMeta | string>(IMAGES_KEY, 0, -1);
  return raw
    .map((item) => (typeof item === "string" ? (JSON.parse(item) as ImageMeta) : item))
    .filter((item): item is ImageMeta => Boolean(item && item.id && item.url));
}

export async function getImage(id: string): Promise<ImageMeta | null> {
  const images = await listImages();
  return images.find((img) => img.id === id) ?? null;
}

export async function addImage(meta: ImageMeta): Promise<void> {
  // LPUSH keeps the list newest-first.
  await kv.lpush(IMAGES_KEY, JSON.stringify(meta));
}

const RECENT_MS = 7 * 24 * 60 * 60 * 1000;

export function isRecent(meta: ImageMeta): boolean {
  return Date.now() - meta.uploadedAt < RECENT_MS;
}

// Unique-session view tracking: a Redis set of session ids per image.
export async function recordView(imageId: string, sessionId: string): Promise<void> {
  await kv.sadd(`views:${imageId}`, sessionId);
}

export async function viewCount(imageId: string): Promise<number> {
  return (await kv.scard(`views:${imageId}`)) ?? 0;
}
