import { NextResponse } from "next/server";

import models from "@/db/mongo";
import { firebaseAdminApp } from "@/db/firebaseInit";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { With_id, t_MongoUserData, t_Role } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = parseInt(searchParams.get("limit") || "20");

  const data = await getPage(skip, limit);

  console.log(req.url);
  console.log(data);

  return NextResponse.json(data);
}

async function getPage(skip: number, pageSize = 20) {
  const docs = await models.User.find({})
    .limit(pageSize)
    .skip(skip)
    .lean()
    .exec();

  // docsRead += docs.length;

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

    combinedData ? fbData.push(combinedData) : null;
  }

  if (fbData[0]?._id === undefined) return null;

  return fbData;
}

async function getDocumentCount() {
  const docs = await models.User.estimatedDocumentCount().exec();
  return docs;
}

async function isLoadingFinished(
  itemsLen: number,
  thoughtFinished: boolean
) {
  let ret = false;

  if ((await getDocumentCount()) <= (itemsLen || 0)) ret = true;
  if (thoughtFinished && !ret) resetLoaded(itemsLen);

  return ret;
}

async function resetLoaded(docsHad = 0) {
  docsHad = docsHad;
}
