"use server";

import { firebaseAdminApp } from "@/db/firebaseInit";
import { PasswordResetStates } from "@/lib/types";
import { FirebaseError } from "firebase-admin";

export async function resetPassword(
  email: string
): Promise<[PasswordResetStates, string]> {
  let resetLink = "";

  try {
    const user = await firebaseAdminApp.auth().getUserByEmail(email);

    if (!user) return [PasswordResetStates.NO_ACCOUNT, resetLink];

    resetLink = await firebaseAdminApp.auth().generatePasswordResetLink(email);

    return [PasswordResetStates.SUCCESS, resetLink];
  } catch (e: any) {
    const err = e as FirebaseError;

    console.log(err);

    if (err.code === "auth/user-not-found")
      return [PasswordResetStates.NO_ACCOUNT, resetLink];

    if (err.code === "auth/invalid-email")
      return [PasswordResetStates.INVALID_EMAIL, resetLink];

    return [PasswordResetStates.ERROR, resetLink];
  }
}
