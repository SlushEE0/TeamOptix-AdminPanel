import { firebaseAdminApp } from "@/db/firebaseInit";
import models, { mongo_createUser } from "@/db/mongo";
import { getSessionCookie } from "@/lib/session";
import { t_UserData } from "@/lib/types";
import { UserRecord } from "firebase-admin/lib/auth/user-record";

export const dynamic = "force-dynamic";

export async function GET() {
  const userData = await getUserData();

  if (userData === 400) {
    return new Response("[toolkit/route.ts] FB could not getUserByEmail", {
      status: 400
    });
  }

  return Response.json(userData);
}

async function getUserData() {
  const jwt = await getSessionCookie();
  const email = jwt?.payload.email as string;

  let fbData;
  try {
    fbData = await firebaseAdminApp.auth().getUserByEmail(email);
    fbData = fbData.toJSON() as UserRecord;
  } catch (e) {
    console.warn(e);
    return 400;
  }

  let mongoData = await models.User.findOne({ uid: fbData.uid }).lean().exec();

  if (!mongoData) {
    const doc = await mongo_createUser(fbData.uid);
    mongoData = doc;
  }

  const sanitizedMongoData = {
    ...mongoData,
    _id: mongoData?._id.toString()
  };

  const role = (() => {
    if (fbData?.customClaims?.admin) return "admin";
    if (fbData?.customClaims?.certified) return "certified";
    return "member";
  })();

  return {
    ...fbData,
    ...sanitizedMongoData,
    role
  } as t_UserData;
}
