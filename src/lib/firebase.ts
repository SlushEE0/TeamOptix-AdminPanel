import { getApp, getApps, initializeApp } from "firebase/app";
// import admin from "firebase-admin";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";

import { ADMIN_CREDENTIALS, BASE_FETCH_URL, FIREBASE_CONFIG } from "./config";
import { createSession, deleteSession, getSession } from "./session";
import { t_UserRecord } from "./types";

export const firebaseApp = !getApps().length
  ? initializeApp(FIREBASE_CONFIG)
  : getApp();
// export const firebaseAdminApp = !admin.apps.length
//   ? admin.initializeApp(
//       {
//         credential: admin.credential.cert({
//           projectId: ADMIN_CREDENTIALS.FIREBASE_PROJECT_ID,
//           clientEmail: ADMIN_CREDENTIALS.FIREBASE_CLIENT_EMAIL,
//           privateKey: ADMIN_CREDENTIALS.FIREBASE_PRIVATE_KEY?.replace(
//             /\\n/g,
//             "\n"
//           )
//         })
//       },
//       "admin"
//     )
//   : admin.app("admin");

export const firebaseAuth = getAuth(firebaseApp);
export const provider = new GoogleAuthProvider();

type userOptions = "user" | "admin" | "certified";
async function authorizeUser(
  userToken: string,
  type: userOptions,
  email = "",
  password = "",
  persist = true
): Promise<AuthStates> {
  let res: any = false;

  try {
    res = await fetch(BASE_FETCH_URL + "/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        endpoint: "authorize",
        payload: {
          token: userToken,
          type
        }
      })
    }).then((res) => res.json());
  } catch (err) {
    console.warn(err);
  }

  console.log("User Auth", email, res);
  switch (true) {
    case res === true:
      persist ? createSession(email, password) : null;
      return AuthStates.AUTHORIZED;
    case res === false:
      return AuthStates.UNAUTHORIZED;
    default:
      return AuthStates.ERROR;
  }
}

export async function signIn_emailPass(
  email: string,
  password: string,
  persist = true
) {
  setPersistence(firebaseAuth, browserLocalPersistence);

  let user;
  try {
    user = (await signInWithEmailAndPassword(firebaseAuth, email, password))
      .user;
  } catch (e) {
    return console.log("User not Found");
  }

  const userIdToken = (await user?.getIdToken()) || "";

  console.log("User Sign-In ", email, userIdToken.length);
  return authorizeUser(userIdToken, "admin", email, password, persist);
}

export async function signIn_google() {
  setPersistence(firebaseAuth, browserLocalPersistence);

  let user;
  try {
    user = (await signInWithPopup(firebaseAuth, provider)).user;
  } catch (e) {
    return console.log("User not Found");
  }

  const userIdToken = (await user?.getIdToken()) || "";

  return authorizeUser(userIdToken, "admin");
}

export function getCurrentUser() {
  return firebaseAuth.currentUser;
}

export async function loginWithPersistedData() {
  const { email, pass } = await getSession();

  console.log(email, pass);

  const loginState = await signIn_emailPass(email, pass, false);

  switch (loginState) {
    case AuthStates.AUTHORIZED:
      break;
    default:
      deleteSession();
  }
}

export async function getUserDataWithUid(uid: string): Promise<t_UserRecord> {
  let res: any = false;

  try {
    res = await fetch(BASE_FETCH_URL + "/api/db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        endpoint: "get-user-data",
        uid
      })
    }).then((res) => res.json());
  } catch (err) {
    console.warn(err);
  }

  return res;
}

export enum AuthStates {
  AUTHORIZED,
  UNAUTHORIZED,
  UNKNOWN,
  ERROR
}
