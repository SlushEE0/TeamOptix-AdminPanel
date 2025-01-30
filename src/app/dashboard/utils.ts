"use server";

import { UserRecord } from "firebase-admin/lib/auth/user-record";

import { firebaseAdminApp } from "@/db/firebaseInit";
import models from "@/db/mongo";

import { BaseRequestStates, t_Code } from "@/lib/types";
import { toLogged } from "@/lib/utils";

export async function createCode(code: t_Code) {
  const doc = await models.Code.create(code);
  return doc._id.toString();
}

export async function getAllCodes() {
  const docs = await models.Code.find({}).lean().exec();
  return docs.map((doc) => {
    return {
      ...doc,
      _id: doc._id.toString()
    };
  });
}

export async function deleteCode(codeName: string) {
  const res = await models.Code.findOneAndDelete({ value: codeName })
    .lean()
    .exec();

  return { ...res, _id: res?._id.toString() };
}

export async function deleteUser(uid: string) {
  toLogged(`Deleting user with uid: ${uid}` , "[DASHBOARD]");
  
  const res = await models.User.findOneAndDelete({ uid }).lean().exec();

  if(!res) return

  let user: UserRecord;
  try {
    user = await firebaseAdminApp.auth().getUser(uid);
  } catch(e) {
    console.log("User doesnt exist");
    return;
  } finally {
    await firebaseAdminApp.auth().deleteUser(uid);
  }

  const userData = {
    ...res,
    ...user,
    _id: res._id.toString(),
  }

  console.warn("DELETED USER:", user.displayName, userData);

  return userData;
}

export async function modifyHours(_id: string, newHours: number) {
  toLogged(`Updating hours for ${_id} to ${newHours}` , "[DASHBOARD]");

  const res = await models.User.updateOne({ _id }, {
    $set: {
      seconds: newHours
    }
  }).lean().exec();

  if(!res) return BaseRequestStates.ERROR;

  return BaseRequestStates.SUCCESS;
}

export async function changeRole(_id: string, newRole: string) {
  toLogged(`Updating role for ${_id} to ${newRole}` , "[DASHBOARD]");

  const res = await models.User.findById(_id).lean().exec();

  if(!res) return BaseRequestStates.ERROR;
  
  try {
    firebaseAdminApp.auth().setCustomUserClaims(res?.uid || "", (() => {
      if(newRole === "admin") return { admin: true };
      if(newRole === "certified") return { admin: false, certified: true };
      return { admin: false, certified:false, member: true };
    })());
  } catch(e) {
    console.error("Error updating role", e);
    return BaseRequestStates.ERROR;
  }

  return BaseRequestStates.SUCCESS;
}