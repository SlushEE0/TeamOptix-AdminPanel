"use server";

import { cookies } from "next/headers";
import { JWTVerifyResult, SignJWT, jwtVerify } from "jose";
import { firebaseAuth } from "../../db/firebase";
import { signOut } from "firebase/auth";

const jwtSecret = new TextEncoder().encode("Toolkit-AdminPanel");

type JWTPayload = {
  email: string;
};

async function encrypt(payload: JWTPayload) {
  // add 7 days unix time
  const expTime = Math.round(Date.now() / 1000 + 604800);

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

export async function getSession() {
  return await decrypt(cookies().get("session")?.value || "");
}

export async function createSession(email: string) {
  encrypt({
    email
  }).then((jwt) => {
    console.log(jwt);

    cookies().set("session", jwt);
  });
}

export async function deleteSession() {
  signOut(firebaseAuth);
  return cookies().delete("session");
}

export async function validateSession() {
  const session = await getSession();
  if (!session) return false;

  const jwtExp: any = session.payload.exp || 0;
  if (!jwtExp) return false;

  if (Date.now() / 1000 < jwtExp) return true;
}
