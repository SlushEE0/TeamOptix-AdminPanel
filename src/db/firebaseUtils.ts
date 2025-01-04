import { FirebaseError } from "firebase/app";
import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";

import { BASE_FETCH_URL } from "../lib/config";
import { createSession, deleteSession, getSession } from "@/lib/session";
import {
  AccountCreationStates,
  t_MongoUserData,
  t_Role,
  t_UserData,
  With_id
} from "../lib/types";
import { AuthStates } from "@/lib/types";

import {
  firebaseAdminApp,
  firebaseAuth,
  provider_google
} from "./firebaseInit";
import { UserRecord } from "firebase-admin/lib/auth/user-record";

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

  const userAdminified = await firebaseAdminApp.auth().getUser(user.uid);
  const isAdmin = userAdminified.customClaims?.admin;

  createSession(email, isAdmin);
  if (isAdmin) {
    console.log(`UserAuthorized: ${email}`);
    return AuthStates.ADMIN_AUTHORIZED;
  } else if (userAdminified.customClaims?.member) {
    console.log(`UserAuthorized: ${email}`);
    return AuthStates.USER_AUTHORIZED;
  }

  return AuthStates.UNAUTHORIZED;
}

// export async function signIn_google() {
//   setPersistence(firebaseAuth, browserLocalPersistence);

//   let user;
//   try {
//     user = (await signInWithPopup(firebaseAuth, provider_google)).user;
//   } catch (e) {
//     return console.log("User not Found");
//   }

//   const userIdToken = (await user?.getIdToken()) || "";

//   return authorizeUser(userIdToken, "admin");
// }

export async function getCurrentUser() {
  return firebaseAuth.currentUser;
}

export async function fb_createUser(
  email: string,
  password: string,
  displayName: string
): Promise<[AccountCreationStates, string]> {
  let userRecord: UserRecord;
  try {
    userRecord = await firebaseAdminApp.auth().getUserByEmail(email);

    if (userRecord.email === email)
      return [AccountCreationStates.IN_USE, userRecord.uid];
  } catch {
    userRecord = await firebaseAdminApp.auth().createUser({
      email,
      displayName,
      password
    });

    firebaseAdminApp
      .auth()
      .setCustomUserClaims(userRecord.uid, { member: true });

    if (!userRecord) return [AccountCreationStates.ERROR, ""];
  }

  return [AccountCreationStates.SUCCESS, userRecord.uid];
}

export async function loginWithPersistedData() {
  const { email, pass } = (await getSession()) as any;

  console.log(email, pass);

  const loginState = await signIn_emailPass(email, pass, false);

  switch (loginState) {
    case AuthStates.ADMIN_AUTHORIZED:
      break;
    default:
      deleteSession();
  }
}

export async function getUserDataWithUid(
  uid: string
): Promise<UserRecord | null> {
  let res: UserRecord | null = null;

  try {
    res = await firebaseAdminApp.auth().getUser(uid);
  } catch (err) {
    console.error(`FB User Data Error (id: ${uid})`);
    console.error(err);
  }

  return res;
}
export async function appendFBdataArr(
  mongoUserData: With_id<t_MongoUserData>[]
) {
  const promiseArr = await mongoUserData.map(async (item) => {
    const userData = (
      await getUserDataWithUid(item.uid)
    )?.toJSON() as UserRecord;

    const role: t_Role = (() => {
      if (userData?.customClaims?.admin) return "admin";
      if (userData?.customClaims?.certified) return "certified";
      return "member";
    })();

    return { ...userData, ...item, role };
  });

  return Promise.all(promiseArr);
}

export async function appendFBdata(
  mongoUserData: With_id<t_MongoUserData>
): Promise<t_UserData> {
  const userData = (
    await getUserDataWithUid(mongoUserData.uid)
  )?.toJSON() as UserRecord;

  const role = (() => {
    if (userData?.customClaims?.admin) return "admin";
    if (userData?.customClaims?.certified) return "certified";
    return "member";
  })();

  return { ...userData, ...mongoUserData, role };
}
