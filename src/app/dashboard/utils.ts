"use server";

import { t_Code, t_CodeType } from "@/lib/types";
import { getUserDataWithUid } from "@/db/firebaseUtils";
import {
  findAndDeleteCode,
  getCodesCol,
  getUsersCol,
  mongoReq
} from "@/db/mongo";

export async function getAllUserData() {
  const usersCol = await getUsersCol();

  const promiseArr = await usersCol.map(async (item) => {
    const userData = (await getUserDataWithUid(item.uid)) || {};

    return { ...userData, ...item };
  });

  return Promise.all(promiseArr);
}

export async function getAllCodes() {
  return getCodesCol();
}

export async function deleteCode(value: string) {
  return findAndDeleteCode(value);
}

export async function createCode(code: t_Code) {
  return mongoReq(async (db) => {
    const doc = await db.collection("settings").insertOne(code);

    if (doc.insertedId) return doc.insertedId.toJSON();

    return (await db.collection("settings").findOne(code))?._id.toJSON();
  });
}
