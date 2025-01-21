import { NextRequest, NextResponse } from "next/server";

import { validateSession } from "./lib/session";
import { SessionStates } from "./lib/types";
import { toLogged } from "./lib/utils";

const redirect = function (reqUrl: URL, pathname: string) {
  if (reqUrl.pathname === pathname) return;

  reqUrl.pathname = pathname;

  return NextResponse.redirect(reqUrl);
};

export async function middleware(req: NextRequest) {
  const sessionData = await validateSession();
  const reqUrl = req.nextUrl.clone();

  if (!sessionData) {
    return redirect(reqUrl, `/login`);
  }

  const [level, payload] = sessionData;

  if (level === SessionStates.ADMIN) {
    if (reqUrl.pathname == `/`) return redirect(reqUrl, `/toolkit`);

    return;
  }
  if (level === SessionStates.USER) {
    return redirect(reqUrl, `/toolkit`);
  }

  return redirect(reqUrl, `/login`);
}

export const config = {
  //ALL PROTECTED ROUTES
  // was going to spread the top two arrays but apparently thats not allowed
  matcher: ["/", "/toolkit", "/dashboard", "/admin", "/user/:path"]
};
