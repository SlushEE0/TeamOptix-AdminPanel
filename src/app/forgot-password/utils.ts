"use server";

import { firebaseAdminApp } from "@/db/firebaseInit";

export async function getPassResetLink(email: string) {
  const user = await firebaseAdminApp.auth().getUserByEmail(email);
  if (user.disabled || !user) return "";

  console.log(`${email} reset password`);

  return firebaseAdminApp.auth().generatePasswordResetLink(email);
}
