"use client";

import { use, useEffect, useState } from "react";
import { Lexend } from "next/font/google";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@nextui-org/spinner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";

import { CodeValidationStates, t_UserData } from "@/lib/types";
import { unixToFancyDate } from "@/lib/utils";
import { getLoggingSession, getUserData, validateCode } from "./utils";
import { Code } from "mongodb";

const lexend = Lexend({
  weight: "300",
  subsets: ["latin"],
  variable: "--font-sans"
});

const lexendThick = Lexend({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans"
});

export default function Toolkit() {
  const [userData, SETuserData] = useState<t_UserData | null>(null);

  // Fetch user data on component load
  useEffect(() => {
    toast.dismiss();
    (async () => {
      const data = await getUserData();

      if (data === "ERROR") {
        toast.error("Error fetching user data", { duration: 999999 });
        return;
      }

      SETuserData(data);
    })();
  }, []);

  return userData ? (
    <LoadedContent {...{ initalData: userData }} />
  ) : (
    <div className="size-full flex items-center justify-center gap-5 pt-4">
      <Spinner size="lg" />
    </div>
  );
}

function LoadedContent({ initalData }: { initalData: t_UserData }) {
  const [userData, SETuserData] = useState(initalData);
  const [code, SETcode] = useState("");
  const [isLogging, SETisLogging] = useState(false);

  const updateIsLogging = async function () {
    const session = await getLoggingSession();

    if (session === -2) return SETisLogging(false);

    if ((session.payload.timeMS as number) < Date.now())
      return SETisLogging(true);
  };

  const updateData = async function () {
    const data = await getUserData();

    if (data === "ERROR") {
      toast.error("Error fetching user data", { duration: 999999 });
      return;
    }

    SETuserData(data);
  };

  useEffect(() => {
    updateIsLogging();
  }, []);

  const handleCodeSubmit = async (e: FormData) => {
    if (!code) {
      toast.error("Please enter a code");
      return;
    }

    const [state, minutesLogged] = await validateCode(code, userData._id);

    switch (state) {
      case CodeValidationStates.SESSION_START:
        toast.success("Session started");
        updateIsLogging();
        break;
      case CodeValidationStates.INVALID:
        toast.error("Invalid code");
        break;
      case CodeValidationStates.SESSION_END:
        toast.success(
          `Session ended. Logged ${minutesLogged.toFixed(2)} minutes`
        );
        updateIsLogging();
        updateData();
        break;
      case CodeValidationStates.NO_SESSION:
        toast.error("No active session");
        break;
      case CodeValidationStates.WRONG_TIME:
        toast.error("You can't check in/out at this time");
        break;
      default:
        toast.error("An error occurred... please refresh page");
        toast.loading("Refreshing page in 5 seconds", { duration: 4800 });

        setTimeout(() => {
          window.location.reload();
        }, 5000);
        break;
    }
  };

  const getTimeStr = function () {
    if (userData.seconds === 0) return "No Hours Logged";

    const hours = userData.seconds / 60 / 60;
    const minutes = (hours % 1) * 60;

    console.log(hours);

    return `${Math.floor(hours)} Hours and ${Math.round(minutes)} Minutes`;
  };

  const getLoggingTextColor = function () {
    if (isLogging) return "text-green-500";
    return "text-red-500";
  };

  return (
    <>
      <div className="container size-full p-4 mx-auto flex items-center justify-center gap-4 flex-col">
        <div className="h-12"></div>
        <h1 className="text-4xl text-center mb-4 absolute top-3">
          Hello <u>{userData.displayName}</u>!
        </h1>
        <div
          className={
            "bg-card text-card-foreground shadow-sm rounded-lg border text-center p-4 text-2xl max-w-96 w-full " +
            getLoggingTextColor()
          }>
          <strong>{getTimeStr()}</strong>
        </div>
        <Card className="max-w-96 w-full max-h-52 grow">
          <CardHeader>
            <CardTitle className={lexendThick.className}>Enter Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCodeSubmit}>
              <Input
                type="text"
                placeholder="x93hsd"
                value={code}
                onChange={(e) => SETcode(e.target.value)}
                className="mb-4"
              />
              <Button className="w-full">
                {isLogging ? "Check Out" : "Check In"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="mb-4 absolute left-3 top-3 hidden xl:block">
          <CardHeader>
            <CardTitle className={lexendThick.className}>
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Name:</strong> {userData.displayName}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <br />
            <p>
              <strong>Build Season Hours:</strong>{" "}
              {(userData.seconds / 1000 / 60 / 60).toFixed(1)}
            </p>
            <p>
              <strong>Meeting Count:</strong> {userData.meetingCount}
            </p>
            <p>
              <strong>Last Check In:</strong>{" "}
              {userData.lastCheckIn
                ? unixToFancyDate(userData.lastCheckIn)
                : "Unknown"}
            </p>
            <br />
            <p>
              <strong>Logging:</strong> {isLogging ? "Yes" : "No"}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
