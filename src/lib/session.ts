import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { firebaseAuth } from "./firebase";
import { signOut } from "firebase/auth";

const jwtSecret = new TextEncoder().encode("Optix 3749");

type ToolkitPayload = {
  email: string;
  pass: string;
  exp: number;
  iss: string;
};

type jwtPayload = {
  email: string;
  pass: string;
};
async function encrypt(payload: jwtPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Date.now() / 1000 + 604800)
    .setIssuer("OptixToolkit Backend")
    .sign(jwtSecret);
}

async function decrypt(jwt: string) {
  try {
    return (
      await jwtVerify(jwt, jwtSecret, {
        algorithms: ["HS256"]
      })
    ).payload;
  } catch (err) {
    console.warn("Invalid JWT");

    return {};
  }
}

export async function getSession() {
  return (await decrypt(
    cookies().get("session")?.value || ""
  )) as ToolkitPayload;
}

export async function createSession(email: string, pass: string) {
  encrypt({
    email,
    pass
  }).then((jwt) => {
    console.log(jwt);

    cookies().set("session", jwt);
  });
}

export async function deleteSession() {
  "use server";
  signOut(firebaseAuth);
  return cookies().delete("session");
}

export async function validateSession() {
  const session = await getSession();
  if (!session) return false;

  const jwtExp = session.exp;
  if (!jwtExp) return false;

  if (Date.now() * 1000 > jwtExp) return true;
}
