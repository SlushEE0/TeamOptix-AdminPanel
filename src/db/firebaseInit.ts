import { ADMIN_CREDENTIALS, FIREBASE_CONFIG } from "@/lib/config";
import * as admin from "firebase-admin";
import { getApps, initializeApp, getApp } from "firebase/app";
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  initializeAuth
} from "firebase/auth";

export const firebaseApp = !getApps().length
  ? initializeApp(FIREBASE_CONFIG)
  : getApp();

export const firebaseAdminApp = !admin.apps.length
  ? admin.initializeApp(
      {
        credential: admin.credential.cert({
          projectId: ADMIN_CREDENTIALS.FIREBASE_PROJECT_ID,
          clientEmail: ADMIN_CREDENTIALS.FIREBASE_CLIENT_EMAIL,
          privateKey: ADMIN_CREDENTIALS.FIREBASE_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          )
        })
      },
      "admin"
    )
  : admin.app("admin");

export const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: browserLocalPersistence
});
export const provider_google = new GoogleAuthProvider();
