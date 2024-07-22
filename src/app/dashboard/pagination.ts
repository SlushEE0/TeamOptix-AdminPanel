"use server";

import { mongoDisconnect, mongoReq, mongo_parseFindCursor } from "@/db/mongo";
import { t_MongoUserData } from "@/lib/types";
import { appendFBdataArr } from "@/db/firebaseUtils";
import { WithId } from "mongodb";

let pageSize = 20;
let docsRead = 0;

export async function setPageSize(newSize: number) {
  pageSize = newSize;
}

export async function getPage() {
  const doc = await mongoReq(async (db) => {
    const data = await mongo_parseFindCursor(
      db
        .collection("users")
        .find<WithId<t_MongoUserData>>({})
        .skip(docsRead)
        .limit(pageSize)
    );

    const count = await db.collection("users").countDocuments(
      {},
      {
        skip: docsRead,
        limit: pageSize
      }
    );

    return [data, count] as const;
  });

  docsRead += doc[1];

  return appendFBdataArr(doc[0]);
}

export async function getDocumentCount() {
  const doc = await mongoReq((db) => {
    return db.collection("users").estimatedDocumentCount();
  });

  return doc;
}

export async function isLoadingFinished(itemsLen?: number) {
  // if (docsRead !== itemsLen)
  //   throw Error(
  //     `Items length does not equal docsRead. ${itemsLen}, ${docsRead}`
  //   );

  if ((await getDocumentCount()) !== docsRead) return false;

  mongoDisconnect();
  return true;
}
