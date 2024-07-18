"use server";

import { With_id, t_MongoUserData } from "@/lib/types";
import { getUserDataWithUid } from "../../db/firebase";
import { findAndDeleteCode, getCodesCol, getUsersCol } from "../../db/mongo";

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

export async function appendFBdataArr(
  mongoUserData: With_id<t_MongoUserData>[]
) {
  const promiseArr = await mongoUserData.map(async (item) => {
    const userData = (await getUserDataWithUid(item.uid)) || {};

    return { ...userData, ...item };
  });

  return Promise.all(promiseArr);
}

export async function appendFBdata(mongoUserData: With_id<t_MongoUserData>) {
  const userData = (await getUserDataWithUid(mongoUserData.uid)) || {};

  return { ...userData, ...mongoUserData };
}
