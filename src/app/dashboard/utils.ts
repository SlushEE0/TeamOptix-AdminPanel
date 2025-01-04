"use server";

import { getUserDataWithUid } from "@/db/firebaseUtils";
import models from "@/db/mongo";
import { t_Code } from "@/lib/types";

export async function createCode(code: t_Code) {
  const doc = await models.Code.create(code);
  return doc._id.toString();
}

export async function getAllCodes() {
  const docs = await models.Code.find({}).lean().exec();
  return docs.map((doc) => {
    return {
      ...doc,
      _id: doc._id.toString()
    };
  });
}

export async function deleteCode(codeName: string) {
  const res = await models.Code.findOneAndDelete({ value: codeName })
    .lean()
    .exec();

  return { ...res, _id: res?._id.toString() };
}
