"use server";

import { getUserDataWithUid } from "../db/firebase";
import {
  findAndDeleteCode,
  getCodesCol,
  getUsersCol,
  mongoReq,
  mongo_parseFindCursor
} from "../db/mongo";

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

class UsersPagination {
  $start;
  $pageSize;
  $currPage = 1;

  constructor(start = 0, pageSize = 20) {
    this.$start = start;
    this.$pageSize = pageSize;
  }

  async getPage() {
    using usingPage = await mongoReq((db) => {
      return db
        .collection("users")
        .find({})
        .skip(this.$start)
        .limit(this.$pageSize);
    });

    return mongo_parseFindCursor(usingPage.ret);
  }
}
