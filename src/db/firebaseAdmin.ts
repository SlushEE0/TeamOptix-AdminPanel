import { ADMIN_CREDENTIALS } from "@/lib/config";
import * as admin from "firebase-admin";

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
