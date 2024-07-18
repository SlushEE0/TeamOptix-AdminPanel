"use server";

import { mongoReq, mongo_parseFindCursor } from "@/db/mongo";
import { t_MongoUserData } from "@/lib/types";
import { appendFBdataArr } from "./utils";

let pageSize = 20;
let currPage = 1;

export async function setPageSize(newSize: number) {
  pageSize = newSize;
}

export async function getPage() {
  using usingPage = await mongoReq((db) => {
    return db
      .collection("users")
      .find({})
      .skip((currPage - 1) * pageSize)
      .limit(pageSize);
  });

  currPage++;

  return appendFBdataArr(
    await mongo_parseFindCursor<t_MongoUserData>(usingPage.ret)
  );
}


export async function getDocumentCount() {
  using usingCol = await mongoReq((db) => {
    return db.collection('users').estimatedDocumentCount()
  })

  return usingCol.ret;
}
