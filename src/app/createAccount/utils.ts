"use server";

import { UserRecord } from "firebase-admin/lib/auth/user-record";

import { AccountCreationStates } from "@/lib/types";
import { firebaseAdminApp } from "@/db/firebaseInit";
import models from "@/db/mongo";
import { NextRequest } from "next/server";
import { createUser } from "@/db/firebaseUtils";

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

  return createUser(loginParams.email, loginParams.password, loginParams.name);
}
