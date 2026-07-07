import { NextRequest, NextResponse } from "next/server";
import { passwordsMatch, siteToken, siteCookieOptions, SITE_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!passwordsMatch(password, process.env.SITE_PASSWORD)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SITE_COOKIE, siteToken(), siteCookieOptions());
  return response;
}
