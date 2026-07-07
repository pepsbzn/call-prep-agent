import { NextRequest, NextResponse } from "next/server";

// Assign every visitor a stable session id so view counts can be
// deduplicated per unique session in KV.
export function middleware(request: NextRequest) {
  if (request.cookies.get("session_id")) {
    return NextResponse.next();
  }
  const response = NextResponse.next();
  response.cookies.set("session_id", crypto.randomUUID(), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
