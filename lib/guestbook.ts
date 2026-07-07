import { kv } from "@vercel/kv";

export interface GuestbookEntry {
  name: string;
  message: string;
  timestamp: number; // epoch ms
}

const GUESTBOOK_KEY = "guestbook";

export async function listEntries(): Promise<GuestbookEntry[]> {
  const raw = await kv.lrange<GuestbookEntry | string>(GUESTBOOK_KEY, 0, -1);
  // LPUSH on write means lrange already returns newest-first.
  return raw
    .map((item) => (typeof item === "string" ? (JSON.parse(item) as GuestbookEntry) : item))
    .filter((item): item is GuestbookEntry => Boolean(item && item.message));
}

export async function addEntry(entry: GuestbookEntry): Promise<void> {
  await kv.lpush(GUESTBOOK_KEY, JSON.stringify(entry));
}
