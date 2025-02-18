"use server";

import { NextResponse } from "next/server";
import { UserRecord } from "firebase-admin/lib/auth/user-record";

import models from "@/db/mongo";
import { firebaseAdminApp } from "@/db/firebaseInit";
import { With_id, t_MongoUserData, t_Role } from "@/lib/types";
import { toLogged } from "@/lib/utils";

const PAGE_SIZE = 20;

export async function getPage(skip: number) {
  const docs = await models.User.find({})
    .limit(PAGE_SIZE)
    .skip(skip)
    .lean()
    .exec();

  // docsRead += docs.length;

  let fbData: Omit<
    UserRecord & With_id<t_MongoUserData> & { role: t_Role },
    "toJSON"
  >[] = [] as any;

  for (const doc of docs) {
    let user: UserRecord;
    
    try {
      user = await firebaseAdminApp.auth().getUser(doc.uid);
    } catch (e) {
      console.error("[UsersTable] Error getting user data for", doc.uid);
      continue;
    }

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

export async function getDocumentCount() {
  const docs = await models.User.estimatedDocumentCount().exec();
  return docs;
}

export async function isLoadingFinished(
  itemsLen: number,
  thoughtFinished: boolean
) {
  let ret = false;

  if ((await getDocumentCount()) <= (itemsLen || 0)) ret = true;
  if (thoughtFinished && !ret) resetLoaded(itemsLen);

  return ret;
}

export async function resetLoaded(docsHad = 0) {
  docsHad = docsHad;
}

export async function getPageSize() {
  return PAGE_SIZE;
}