"use server";

import { WithId, ObjectId } from "mongodb";

import { appendFBdata } from "@/db/firebase";
import { mongoReq, mongo_parseDocId } from "@/db/mongo";
import { t_MongoUserData } from "@/lib/types";

export async function getUserDataByID(id: string) {
  if (id.length !== 24) return null;

  const doc = await mongoReq((db) => {
    return db
      .collection("users")
      .findOne<WithId<t_MongoUserData>>({ _id: new ObjectId(id) });
  });

  if (!doc.ret) return null;

  const json = await mongo_parseDocId(doc.ret);

  return appendFBdata(json);
}

