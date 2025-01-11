import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import models from "@/db/mongo";
import { CodeValidationStates } from "@/lib/types";
import { LOGGING_COOKIE_MAXAGE } from "@/lib/config";

const jwtSecret = new TextEncoder().encode("Toolkit-AdminPanel");

export async function POST(req: Request) {
  const { code, userId } = await req.json();

  const [state, minsLogged] = await userAction(code, userId);
  return Response.json({ state, minsLogged });
}

export async function GET() {
  const session = await getLoggingSession();

  return Response.json(session);
}

async function startLoggingSession(startCode: string, userId: string) {
  const timeMS = Date.now();
  const jwt = await new SignJWT({ startCode, timeMS, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("OptixToolkit Backend")
    .setExpirationTime("10 hours from now")
    .sign(jwtSecret);

  (await cookies()).set("loggingSession", jwt, {
    maxAge: LOGGING_COOKIE_MAXAGE
  });

  console.log("[H-Logging] Session started for user", userId);
}

async function getLoggingSession() {
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

async function endLoggingSession() {
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

async function userAction(code: string, userId: string) {
  const codeDoc = await models.Code.findOne({ value: code }).lean().exec();

  if (!codeDoc) {
    return [CodeValidationStates.INVALID, 0];
  }

  const currentTimeMS = Date.now();
  const test = new Date();
  test.setTime(currentTimeMS);

  console.log(test.toString());

  if (
    codeDoc.startTimeMS > currentTimeMS ||
    codeDoc.endTimeMS < currentTimeMS
  ) {
    return [CodeValidationStates.WRONG_TIME, 0];
  }

  if (codeDoc.key === "checkInPassword") {
    const session = await getLoggingSession();
    if (session !== -2) return [CodeValidationStates.ALREADY_STARTED, 0];

    startLoggingSession(code, userId);
    return [CodeValidationStates.SESSION_START, 0];
  }

  if (codeDoc.key === "checkOutPassword") {
    const res = await endLoggingSession();

    if (res === -1) {
      return [CodeValidationStates.INVALID, 0];
    }
    if (res === -2) {
      return [CodeValidationStates.NO_SESSION, 0];
    }

    return [CodeValidationStates.SESSION_END, res / 1000 / 60];
  }

  return [CodeValidationStates.INVALID, 0];
}
