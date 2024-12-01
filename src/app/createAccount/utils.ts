"use server";

import { UserRecord } from "firebase-admin/lib/auth/user-record";

import { AccountCreationStates } from "@/lib/types";
import { firebaseAdminApp } from "@/db/firebaseInit";
import models from "@/db/mongo";

type t_AccountCreationParams = {
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
  name: string;
};

export async function createAccount(loginParams: t_AccountCreationParams) {
  if (loginParams.code.length !== 5) {
    return AccountCreationStates.INVALID_CODE;
  }

  if (loginParams.password !== loginParams.confirmPassword) {
    return AccountCreationStates.PASSWORD_MISMATCH;
  }

  const codeExists = await models.AccountCode.exists({
    code: loginParams.code,
    type: "create"
  }).exec();

  if (!codeExists?._id) return AccountCreationStates.INVALID_CODE;

  let userRecord: UserRecord;
  try {
    userRecord = await firebaseAdminApp
      .auth()
      .getUserByEmail(loginParams.email);

    if (userRecord.email === loginParams.email)
      return AccountCreationStates.IN_USE;
  } catch {
    userRecord = await firebaseAdminApp.auth().createUser({
      email: loginParams.email,
      displayName: loginParams.name,
      password: loginParams.password
    });

    firebaseAdminApp
      .auth()
      .setCustomUserClaims(userRecord.uid, { member: true });

    if (!userRecord) return AccountCreationStates.ERROR;
  }

  return AccountCreationStates.SUCCESS;
}
