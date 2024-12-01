"use server";

import models from "@/db/mongo";
import { appendFBdataArr } from "@/db/firebaseUtils";

let pageSize = 20;
let docsRead = 0;

let nonames = 0;

export async function setPageSize(newSize: number) {
  pageSize = newSize;
}

export async function getPage() {
  const docs = await models.User.find({})
    .limit(pageSize)
    .skip(docsRead)
    .lean()
    .exec();

  const stringifiedIdDocs = docs.map((doc) => {
    return {
      ...doc,
      _id: doc._id.toString()
    };
  });

  if (!docs) return [];
  else docsRead += docs?.length;

  const fbData = await appendFBdataArr(stringifiedIdDocs);

  fbData.map((doc) => {
    if (doc.email === "" && doc.displayName === "") {
      console.warn(
        `No Name/Email Found for user ${doc.uid}. Removing from list...`
      );
      console.warn(doc);
      return;
    }
  });

  return fbData;
}

export async function getDocumentCount() {
  const docs = await models.User.estimatedDocumentCount().exec();
  return docs - nonames;
}

export async function isLoadingFinished(itemsLen?: number) {
  if ((await getDocumentCount()) !== docsRead) return false;

  return true;
}
