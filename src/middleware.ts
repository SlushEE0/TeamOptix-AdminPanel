import { NextRequest, NextResponse } from "next/server";

import { validateSession } from "./lib/session";
import { SessionStates } from "./lib/types";

export async function middleware(req: NextRequest) {
  const sessionData = await validateSession();

  if (sessionData) {
    const sessionState = sessionData[0];
    const reqUrl = new URL(req.url);

    if (sessionState === SessionStates.ADMIN) return;
    if (
      sessionState === SessionStates.USER &&
      ["/toolkit"].includes(reqUrl.pathname.slice(0, 9))
    ) {
      if (reqUrl.pathname == `/toolkit/${sessionData[1].email}`) return;

      return NextResponse.redirect(`/toolkit/${sessionData[1].email}`);
    }
  }

  console.log(`[SessionValidate] Redirect: ${new URL(req.url).origin}/login`);

  return NextResponse.redirect(`${new URL(req.url).origin}/login`);
}

export const config = {
  //ALL PROTECTED ROUTES
  // was going to spread the top two arrays but apparently thats not allowed
  matcher: ["/", "/toolkit/:path", "/dashboard", "/admin", "/user/:path"]
};
