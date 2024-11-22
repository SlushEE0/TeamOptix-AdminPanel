"use server";

import models from "@/db/mongo";
import { appendFBdataArr } from "@/db/firebaseUtils";

let pageSize = 20;
let docsRead = 0;

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

  return appendFBdataArr(stringifiedIdDocs);
}

export async function getDocumentCount() {
  return await models.User.estimatedDocumentCount().exec();
}

export async function isLoadingFinished(itemsLen?: number) {
  if ((await getDocumentCount()) !== docsRead) return false;

  return true;
}
