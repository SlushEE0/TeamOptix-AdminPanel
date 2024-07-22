import { FirebaseError } from "firebase/app";
import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";

import { BASE_FETCH_URL } from "../lib/config";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { t_MongoUserData, t_Role, t_UserRecord, With_id } from "../lib/types";
import { AuthStates } from "@/lib/types";

import { firebaseAuth, provider_google } from "./firebaseApp";

type userOptions = "user" | "admin" | "certified";
async function authorizeUser(
  userToken: string,
  type: userOptions,
  email = "",
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

  console.log(`${email}-Authorize`, res);
  switch (true) {
    case res === true:
      persist ? createSession(email) : null;
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
    if ((e as FirebaseError).code === "auth/wrong-password") {
      console.log("Unknown User");
      return AuthStates.UNKNOWN;
    }

    return AuthStates.ERROR;
  }

  const userIdToken = (await user?.getIdToken()) || "";

  console.log(`${email}-SignIn`, userIdToken.length);
  return authorizeUser(userIdToken, "admin", email, persist);
}

export async function signIn_google() {
  setPersistence(firebaseAuth, browserLocalPersistence);

  let user;
  try {
    user = (await signInWithPopup(firebaseAuth, provider_google)).user;
  } catch (e) {
    return console.log("User not Found");
  }

  const userIdToken = (await user?.getIdToken()) || "";

  return authorizeUser(userIdToken, "admin");
}

export async function getCurrentUser() {
  return firebaseAuth.currentUser;
}

export async function loginWithPersistedData() {
  const { email, pass } = (await getSession()) as any;

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
    res = await fetch(BASE_FETCH_URL + "/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        endpoint: "get-user",
        payload: {
          uid
          // auth: //insert token
        }
      })
    }).then((res) => res.json());
  } catch (err) {
    console.warn(err);
  }

  return res;
}
export async function appendFBdataArr(
  mongoUserData: With_id<t_MongoUserData>[]
) {
  const promiseArr = await mongoUserData.map(async (item) => {
    const userData = (await getUserDataWithUid(item.uid)) || {};

    const role: t_Role = (() => {
      if (userData.customClaims?.admin) return "admin";
      if (userData.customClaims?.certified) return "certified";
      return "member";
    })();

    return { ...userData, ...item, role };
  });

  return Promise.all(promiseArr);
}

export async function appendFBdata<T>(mongoUserData: { uid: string } & T) {
  const userData = (await getUserDataWithUid(mongoUserData.uid)) || {};

  const role = (() => {
    if (userData.customClaims?.member) return "member";
    if (userData.customClaims?.admin) return "admin";
    if (userData.customClaims?.certified) return "member";
  })();

  return { ...userData, ...mongoUserData, role };
}