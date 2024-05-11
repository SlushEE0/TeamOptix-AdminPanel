"use server";

import { getUserDataWithUid } from "./firebase";
import {
  findAndDeleteCode,
  getCodesCol,
  getUsersCol,
  mongo_cursorToJSON
} from "./mongo";
import { t_CodesTableData } from "./types";

export async function getAllUserData() {
  const usersCol = await getUsersCol();

  const promiseArr = await usersCol.map(async (item) => {
    const userData = (await getUserDataWithUid(item.uid)) || {};

    return { ...userData, ...item };
  });

  return Promise.all(promiseArr);
}

export async function getAllCodes(): Promise<t_CodesTableData[]> {
  const ret = await getCodesCol();
  return mongo_cursorToJSON(ret.ret) as any;
}

export async function deleteCode(value: string) {
  return (await findAndDeleteCode(value)).ret;
}
