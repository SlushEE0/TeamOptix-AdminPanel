"use server";

import { cookies } from "next/headers";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { SignJWT, jwtVerify } from "jose";

import { firebaseAdminApp } from "@/db/firebaseInit";
import { getSession } from "@/lib/session";
import models, { mongo_createUser, reconnect } from "@/db/mongo";
import { CodeValidationStates, t_UserData } from "@/lib/types";

const jwtSecret = new TextEncoder().encode("Toolkit-AdminPanel");

export async function getUserData() {
  const jwt = await getSession();
  const email = jwt?.payload.email as string;

  let fbData;
  try {
    fbData = await firebaseAdminApp.auth().getUserByEmail(email);
    fbData = fbData.toJSON() as UserRecord;
  } catch (e) {
    console.warn(e);

    return "ERROR";
  }

  let mongoData = await models.User.findOne({ uid: fbData.uid }).lean().exec();

  if (!mongoData) {
    const doc = await mongo_createUser(fbData.uid);

    mongoData = doc;
  }

  const sanitizedMongoData = {
    ...mongoData,
    _id: mongoData?._id.toString()
  };

  const role = (() => {
    if (fbData?.customClaims?.admin) return "admin";
    if (fbData?.customClaims?.certified) return "certified";
    return "member";
  })();

  return {
    ...fbData,
    ...sanitizedMongoData,
    role
  } as t_UserData;
}

async function startLoggingSession(startCode: string, userId: string) {
  const timeMS = Date.now();
  const jwt = await new SignJWT({ startCode, timeMS, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("OptixToolkit Backend")
    .setExpirationTime("7 days from now")
    .sign(jwtSecret);

  cookies().set("loggingSession", jwt);
}

export async function getLoggingSession() {
  const jwt = cookies().get("loggingSession")?.value || "";

  let session;
  try {
    session = await jwtVerify(jwt, jwtSecret, {
      algorithms: ["HS256"]
    });
  } catch (err) {
    console.warn("Invalid JWT");

    return -2;
  }

  return session;
}

async function endLoggingSession() {
  const jwt = cookies().get("loggingSession")?.value || "";

  let session;
  try {
    session = await jwtVerify(jwt, jwtSecret, {
      algorithms: ["HS256"]
    });
  } catch (err) {
    console.warn("Invalid JWT");

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

  cookies().delete("loggingSession");
  return duration;
}

export async function validateCode(code: string, userId: string) {
  //! TODO: Database Valid dates. Currently hardcoded

  console.warn("TIMECHECKING IS CURRENTTLY HARDCODED");
  console.warn("DB BASED DATES ASAP");

  const DAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ] as const;

  //! TODO: REMOVE ANY
  const valid: any = {
    saturday: {
      start: {
        hour: 9,
        minute: 0
      },
      end: {
        hour: 17,
        minute: 30
      }
    }
    // friday: {
    //   start: {
    //     hour: 21,
    //     minute: 45
    //   },
    //   end: {
    //     hour: 21,
    //     minute: 50
    //   }
    // }
  } as const;

  const date = new Date();

  const day = DAYS[date.getDay()];
  const hour = date.getHours();
  const minute = date.getMinutes();

  if (hour < valid[day].start.hour) {
    return [CodeValidationStates.WRONG_TIME, 0];
  }
  if (hour > valid[day].end.hour) {
    return [CodeValidationStates.WRONG_TIME, 0];
  }
  if (hour === valid[day].end.hour && minute > valid[day].start.minute) {
    return [CodeValidationStates.WRONG_TIME, 0];
  }

  const codeDoc = await models.Code.findOne({ value: code }).lean().exec();

  if (!codeDoc) {
    return [CodeValidationStates.INVALID, 0];
  }

  if (codeDoc.key === "checkInPassword") {
    startLoggingSession(code, userId);

    return [CodeValidationStates.STARTED, 0];
  }

  if (codeDoc.key === "checkOutPassword") {
    const res = await endLoggingSession();

    if (res === -1) {
      return [CodeValidationStates.INVALID, 0];
    }
    if (res === -2) {
      return [CodeValidationStates.NO_SESSION, 0];
    }

    return [CodeValidationStates.ENDED, res / 1000 / 60];
  }

  return [CodeValidationStates.INVALID, 0];
}
