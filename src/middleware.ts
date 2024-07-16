import { NextRequest, NextResponse } from "next/server";

import { validateSession } from "./app/auth/session";

export async function middleware(req: NextRequest) {
  if (await validateSession()) return;

  console.log(`Redirecting to ${new URL(req.url).origin}/login`);

  return NextResponse.redirect(`${new URL(req.url).origin}/login`);
}

export const config = {
  //ALL PROTECTED ROUTES
  matcher: ["/"]
};
