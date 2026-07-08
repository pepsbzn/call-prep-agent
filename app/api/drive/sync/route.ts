import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { syncDriveFolder } from "@/lib/driveSync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel Cron requests carry this header when CRON_SECRET is set — see
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs.
function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function handle(request: NextRequest) {
  if (!isAuthorizedCron(request) && !isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncDriveFolder();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Drive sync failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}

// GET: invoked by the Vercel Cron schedule.
export async function GET(request: NextRequest) {
  return handle(request);
}

// POST: the "Sync now" button on /upload.
export async function POST(request: NextRequest) {
  return handle(request);
}
