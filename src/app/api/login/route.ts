import { signIn_emailPass } from "@/db/firebaseUtils";
import { LOGIN_COOKIE_MAXAGE } from "@/lib/config";
import { createSession } from "@/lib/session";
import { AuthStates } from "@/lib/types";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, pass }: { email: string; pass: string } = await req.json();

  const authState = await signIn_emailPass(email, pass);

  console.log(`[LOGIN] ${email} ${authState}`);
  switch (authState) {
    case AuthStates.ADMIN_AUTHORIZED:
      await createSession(email, true);
      break;
    case AuthStates.USER_AUTHORIZED:
      await createSession(email, false);
      break;
    case AuthStates.WRONG_PASSWORD:
      return new Response(
        JSON.stringify({
          message: "Incorrect Password",
          state: authState
        }),
        {
          status: 400
        }
      );
    case AuthStates.UNAUTHORIZED:
      return new Response(
        JSON.stringify({
          message: "Unauthorized",
          state: authState
        }),
        {
          status: 403
        }
      );
    default:
      return AuthStates.ERROR;
  }

  const jwt = (await cookies()).get("session")?.value || "";
  const res = NextResponse.json({ message: "Authenticated", state: authState });
  res.cookies.set("session", jwt, {
    maxAge: LOGIN_COOKIE_MAXAGE,
    expires: Date.now() + LOGIN_COOKIE_MAXAGE * 1000,
    sameSite: "none",
    httpOnly: true,
    secure: true
  });

  return res;
}
