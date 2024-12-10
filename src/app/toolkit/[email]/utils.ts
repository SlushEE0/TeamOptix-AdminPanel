import { firebaseAdminApp } from "@/db/firebaseInit";
import { getSession } from "@/lib/session";
import models from "@/db/mongo";
import { t_UserData } from "@/lib/types";

export async function getUserData() {
  const jwt = await getSession();
  const email = jwt?.payload.email as string;

  const fbData = await firebaseAdminApp.auth().getUserByEmail(email);
  const mongoData = await models.User.findOne({ uid: fbData.uid })
    .lean()
    .exec();

  const mongoStringifiedID = { ...mongoData, _id: mongoData?._id.toString() };

  const role = (() => {
    if (fbData?.customClaims?.admin) return "admin";
    if (fbData?.customClaims?.certified) return "certified";
    return "member";
  })();

  return {
    ...fbData,
    ...mongoStringifiedID,
    role
  } as t_UserData;
}
