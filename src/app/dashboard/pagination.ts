"use server";

import models from "@/db/mongo";
import { firebaseAdminApp } from "@/db/firebaseInit";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { With_id, t_MongoUserData, t_Role } from "@/lib/types";

let pageSize = 20;
let docsRead = 0;

let nonames = 0;

export async function setPageSize(newSize: number) {
  pageSize = newSize;
}

export async function getPage() {  
  const docs = await models.User.find({})
    .limit(pageSize)
    .skip(docsRead)
    .lean()
    .exec();

  docsRead += docs.length;

  let fbData: Omit<
    UserRecord & With_id<t_MongoUserData> & { role: t_Role },
    "toJSON"
  >[] = [] as any;

  for (const doc of docs) {
    const user = await firebaseAdminApp.auth().getUser(doc.uid);

    const combinedData = await (async () => {
      if (user.email === "" && user.displayName === "") {
        console.warn(
          `No Name/Email Found for user ${user.uid}. Removing from list...`
        );
        console.warn(user);
        return;
      }

      const role: t_Role = (() => {
        if (user?.customClaims?.admin) return "admin";
        if (user?.customClaims?.certified) return "certified";
        return "member";
      })();

      return {
        ...(user.toJSON() as UserRecord),
        ...doc,
        role,
        _id: doc._id.toString()
      };
    })();

    combinedData ? fbData.push(combinedData) : nonames++;
  }

  if(fbData[0]?._id === undefined) return null;

  return fbData;
}

export async function getDocumentCount() {
  const docs = await models.User.estimatedDocumentCount().exec();
  return docs - nonames;
}

export async function isLoadingFinished(itemsLen: number) {
  console.log(itemsLen)

  if ((await getDocumentCount()) <= (itemsLen || 0)) return true;

  return false;
}
