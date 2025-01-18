"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { SessionStates } from "./types";
import { LOGIN_COOKIE_MAXAGE } from "./config";

const jwtSecret = new TextEncoder().encode("Toolkit-AdminPanel");

type JWTPayload = {
  email: string;
  isAdmin: boolean;
};

async function encrypt(payload: JWTPayload) {
  // add 7 days unix time
  // const expTime = Math.round(Date.now() / 1000 + 604800);

  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("OptixToolkit Backend")
    .setExpirationTime("7 days from now")
    .sign(jwtSecret);
}

async function decrypt(jwt: string) {
  try {
    return await jwtVerify(jwt, jwtSecret, {
      algorithms: ["HS256"]
    });
  } catch (err) {
    console.warn("Invalid JWT");
  }
}

export async function getSessionCookie() {
  return await decrypt((await cookies()).get("session")?.value || "");
}

export async function createSessionCookie(email: string, isAdmin = false) {
  return encrypt({
    email,
    isAdmin
  });
}

export async function createSession(email: string, isAdmin = false) {
  const jwt = await createSessionCookie(email, isAdmin);

  (await cookies()).set("session", jwt, {
    maxAge: LOGIN_COOKIE_MAXAGE,
    sameSite: "none"
  });
}

export async function deleteSession() {
  return (await cookies()).delete("session");
}

export async function validateSession() {
  const session = await getSessionCookie();

  if (!session) return false;

  let level = SessionStates.USER;

  const jwtExp: any = session.payload.exp || 0;
  if (!jwtExp) SessionStates.EXPIRED;

  if (Date.now() / 1000 > jwtExp) level = SessionStates.EXPIRED;
  if (session.payload.isAdmin) level = SessionStates.ADMIN;

  return [level, session.payload] as const;
}
