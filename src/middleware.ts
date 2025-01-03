import { NextRequest, NextResponse } from "next/server";

import { validateSession } from "./lib/session";
import { SessionStates } from "./lib/types";

export async function middleware(req: NextRequest) {
  const sessionData = await validateSession();
  const reqUrl = new URL(req.url);

  if (!sessionData) {
    return NextResponse.redirect(`${new URL(req.url).origin}/login`);
  }

  const [level, payload] = sessionData;

  if (level === SessionStates.ADMIN) return;
  if (level === SessionStates.USER) {
    if (reqUrl.pathname == `/toolkit`) return;
  }

  return NextResponse.redirect(`${new URL(req.url).origin}/login`);
}

export const config = {
  //ALL PROTECTED ROUTES
  // was going to spread the top two arrays but apparently thats not allowed
  matcher: ["/", "/toolkit", "/dashboard", "/admin", "/user/:path"]
};
