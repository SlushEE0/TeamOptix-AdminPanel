import { FIREBASE_CONFIG } from "@/lib/config";
import { getApps, initializeApp, getApp } from "firebase/app";
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  initializeAuth
} from "firebase/auth";

export const firebaseApp = !getApps().length
  ? initializeApp(FIREBASE_CONFIG)
  : getApp();

export const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: browserLocalPersistence
});
export const provider_google = new GoogleAuthProvider();
