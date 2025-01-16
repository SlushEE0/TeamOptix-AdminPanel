"use server";

import { signIn_emailPass } from "@/db/firebaseUtils";

export async function validateAuth(email: string, pass: string) {
  return signIn_emailPass(email, pass);
}
