"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import models from "@/db/mongo";
import { CodeValidationStates } from "@/lib/types";

const jwtSecret = new TextEncoder().encode("Toolkit-AdminPanel");

export async function startLoggingSession(startCode: string, userId: string) {
  const timeMS = Date.now();
  const jwt = await new SignJWT({ startCode, timeMS, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("OptixToolkit Backend")
    .setExpirationTime("10 hours from now")
    .sign(jwtSecret);

  (await cookies()).set("loggingSession", jwt);

  console.log("[H-Logging] Session started for user", userId);
}

export async function getLoggingSession() {
  const jwt = (await cookies()).get("loggingSession")?.value || "";

  let session;
  try {
    session = await jwtVerify(jwt, jwtSecret, {
      algorithms: ["HS256"]
    });
  } catch (err) {
    return -2;
  }

  return session;
}

export async function endLoggingSession() {
  const jwt = (await cookies()).get("loggingSession")?.value || "";

  let session;
  try {
    session = await jwtVerify(jwt, jwtSecret, {
      algorithms: ["HS256"]
    });
  } catch (err) {
    return -2;
  }

  const startCode = session.payload.startCode;
  const codeDoc = await models.Code.findOne({ value: startCode }).lean().exec();

  if (!codeDoc) {
    return -1;
  }

  const nowMs = Date.now();
  const duration = nowMs - (session.payload.timeMS as number);
  const userId = session.payload.userId;

  const userDoc = await models.User.updateOne(
    { _id: userId },
    {
      $inc: { seconds: (duration / 1000).toFixed(2), meetingCount: 1 },
      $set: { lastCheckIn: nowMs }
    }
  )
    .lean()
    .exec();

  if (!userDoc) {
    return -1;
  }

  (await cookies()).delete("loggingSession");
  console.log("[H-Logging] Session ended for user", userId);

  return duration;
}

export async function validateCode(code: string, userId: string) {
  const codeDoc = await models.Code.findOne({ value: code }).lean().exec();

  const ret = {
    state: CodeValidationStates.INVALID,
    minsLogged: 0
  };

  if (!codeDoc) {
    return ret;
  }

  const currentTimeMS = Date.now();
  const test = new Date();
  test.setTime(currentTimeMS);

  console.log(test.toString());

  if (
    codeDoc.startTimeMS > currentTimeMS ||
    codeDoc.endTimeMS < currentTimeMS
  ) {
    ret.state = CodeValidationStates.WRONG_TIME;
    return ret;
  }

  if (codeDoc.key === "checkInPassword") {
    const session = await getLoggingSession();
    if (session !== -2) {
      ret.state = CodeValidationStates.ALREADY_STARTED;
      return ret;
    }

    startLoggingSession(code, userId);
    ret.state = CodeValidationStates.SESSION_START;
    return ret;
  }

  if (codeDoc.key === "checkOutPassword") {
    const res = await endLoggingSession();

    if (res === -1) {
      ret.state = CodeValidationStates.INVALID;
      return ret;
    }
    if (res === -2) {
      ret.state = CodeValidationStates.NO_SESSION;
      return ret;
    }

    ret.minsLogged = res / 1000 / 60;
    ret.state = CodeValidationStates.SESSION_END;
    return ret;
  }

  return ret;
}
