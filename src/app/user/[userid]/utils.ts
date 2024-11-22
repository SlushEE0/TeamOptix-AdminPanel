"use server";

import { ObjectId } from "mongodb";

import { appendFBdata } from "@/db/firebaseUtils";
import models from "@/db/mongo";
import { t_Role } from "@/lib/types";
import { firebaseAdminApp } from "@/db/firebaseInit";

export async function getUserDataByID(id: string) {
  if (id.length !== 24) return null;

  const doc = await models.User.findOne({ _id: new ObjectId(id) })
    .lean()
    .exec();
  const stringifiedIdDoc = {
    ...doc,
    _id: doc?._id.toString(),
    uid: doc?.uid || ""
  };

  if (!doc?.uid) return null;

  return appendFBdata(stringifiedIdDoc);
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
