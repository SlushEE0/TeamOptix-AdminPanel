"use server";

import { cookies } from "next/headers";

import { signIn_emailPass } from "@/db/firebaseUtils";
import { createSessionCookie } from "@/lib/session";
import { AuthStates } from "@/lib/types";

import { LOGIN_COOKIE_MAXAGE } from "@/lib/config";

export async function validateAuth(email: string, pass: string) {
  const { isMember, isAdmin } = await signIn_emailPass(email, pass);

  if (!isMember && !isAdmin) return AuthStates.UNAUTHORIZED;

  try {
    console.log(`UserAuthorized: ${email}`);

    const jwt = await createSessionCookie(email, isAdmin);
    (await cookies()).set("session", jwt, { maxAge: LOGIN_COOKIE_MAXAGE });

    if (isAdmin) {
      return AuthStates.ADMIN_AUTHORIZED;
    } else if (isMember) {
      return AuthStates.USER_AUTHORIZED;
    }
  } catch {
    return AuthStates.ERROR;
  }

  return AuthStates.UNAUTHORIZED;
}
