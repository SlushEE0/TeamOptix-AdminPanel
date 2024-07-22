"use server";

import { WithId, ObjectId } from "mongodb";

import { appendFBdata } from "@/db/firebaseUtils";
import { mongoReq, mongo_parseDocId } from "@/db/mongo";
import { t_MongoUserData, t_Role } from "@/lib/types";
import { firebaseAdminApp } from "@/db/firebaseAdmin";

export async function getUserDataByID(id: string) {
  if (id.length !== 24) return null;

  const doc = await mongoReq(async (db) => {
    const doc = await db
      .collection("users")
      .findOne<WithId<t_MongoUserData>>({ _id: new ObjectId(id) });

    return doc ? mongo_parseDocId(doc) : null;
  });

  if (!doc) return null;

  const json = await mongo_parseDocId(doc);

  return appendFBdata(json);
}

export async function changeRole(role: t_Role, uid: string) {
  let claims: any = {
    admin: null,
    certified: null,
    member: true
  };
  claims[role] = true;

  firebaseAdminApp.auth().setCustomUserClaims(uid, claims);
}
