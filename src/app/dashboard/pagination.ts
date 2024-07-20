"use server";

import { mongoReq, mongo_parseFindCursor } from "@/db/mongo";
import { t_MongoUserData } from "@/lib/types";
import { appendFBdataArr } from "@/db/firebase";

let pageSize = 20;
let currPage = 1;

export async function setPageSize(newSize: number) {
  pageSize = newSize;
}

export async function getPage() {
  const doc = await mongoReq((db) => {
    return db
      .collection("users")
      .find({})
      .skip((currPage - 1) * pageSize)
      .limit(pageSize);
  });

  currPage++;

  return appendFBdataArr(await mongo_parseFindCursor<t_MongoUserData>(doc));
}

export async function getDocumentCount() {
  const doc = await mongoReq((db) => {
    return db.collection("users").estimatedDocumentCount();
  });

  return doc;
}
