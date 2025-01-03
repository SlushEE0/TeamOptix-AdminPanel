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
    <div className="size-full flex items-center justify-center gap-5">
      <Spinner size="lg" />
      Loading ...
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

  const handleCodeSubmit = async () => {
    if (!code) {
      toast.error("Please enter a code");
      return;
    }

    const [state, minutesLogged] = await validateCode(code, userData._id);

    switch (state) {
      case CodeValidationStates.STARTED:
        toast.success("Session started");
        updateIsLogging();
        break;
      case CodeValidationStates.INVALID:
        toast.error("Invalid code");
        break;
      case CodeValidationStates.ENDED:
        toast.success(`Session ended. Logged ${minutesLogged} hours`);
        updateIsLogging();
        updateData();
        break;
      case CodeValidationStates.NO_SESSION:
        toast.error("No active session");
        break;
      default:
        toast.error("An error occurred");
        break;
    }
  };

  return (
    <div className="container mx-auto p-4 w-[30rem]">
      <Card className="mb-4">
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
      <Card>
        <CardHeader>
          <CardTitle className={lexendThick.className}>Enter Code</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Enter your code"
            value={code}
            onChange={(e) => SETcode(e.target.value)}
            className="mb-4"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleCodeSubmit} className="w-full">
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
