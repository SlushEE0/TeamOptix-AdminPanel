"use server";

import { signIn_emailPass } from "@/db/firebase";
import { firebaseAdminApp } from "@/db/firebaseAdmin";
import { validateSession } from "./session";

export async function getPassResetLink(email: string) {
  const user = await firebaseAdminApp.auth().getUserByEmail(email);
  if (user.disabled || !user) return "";

  console.log(`${email} reset password`);

  return firebaseAdminApp.auth().generatePasswordResetLink(email);
}
export async function validateAuth(email: string, pass: string) {
  return signIn_emailPass(email, pass);
}

export async function sessionCheck() {
  const session = await validateSession();
}

export async function getGsignInLink() {
  // firebaseAdminApp.auth().;
  // signIn
}
