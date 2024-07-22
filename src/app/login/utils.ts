"use server";

import { signIn_emailPass } from "@/db/firebaseUtils";
import { firebaseAuth, provider_google } from "@/db/firebaseApp";
import { signInWithRedirect } from "firebase/auth";

export async function validateAuth(email: string, pass: string) {
  return signIn_emailPass(email, pass);
}
