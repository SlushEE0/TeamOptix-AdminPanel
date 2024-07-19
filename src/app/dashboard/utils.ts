"use server";

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
