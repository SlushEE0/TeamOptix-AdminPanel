"use server";

import { cookies } from "next/headers";

import { signIn_emailPass } from "@/db/firebaseUtils";
import { createSessionCookie } from "@/lib/session";
import { AuthStates } from "@/lib/types";

import { LOGIN_COOKIE_MAXAGE } from "@/lib/config";

export async function validateAuth(email: string, pass: string) {
  let state: AuthStates = AuthStates.ERROR;

  try {
    state = await signIn_emailPass(email, pass);
  } catch (e) {}

  let jwt = "";

  switch (state) {
    case AuthStates.ADMIN_AUTHORIZED:
      jwt = await createSessionCookie(email, true);
      (await cookies()).set("session", jwt, {
        maxAge: LOGIN_COOKIE_MAXAGE,
        sameSite: false
      });
      return AuthStates.ADMIN_AUTHORIZED;
    case AuthStates.USER_AUTHORIZED:
      jwt = await createSessionCookie(email, false);
      (await cookies()).set("session", jwt, {
        maxAge: LOGIN_COOKIE_MAXAGE,
        sameSite: false
      });
      return AuthStates.USER_AUTHORIZED;
    default:
      return state;
  }
}
