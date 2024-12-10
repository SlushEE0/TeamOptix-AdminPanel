"use client";

import { useState } from "react";
import { Lexend } from "next/font/google";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { t_UserData } from "@/lib/types";
import { unixToFancyDate } from "@/lib/utils";
import { getUserData } from "./utils";

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

export default async function Toolkit() {
  const userData = await getUserData();

  const [code, SETcode] = useState("");

  const handleCodeSubmit = async () => {
    if (!code) {
      toast.error("Please enter a code");
      return;
    }
    // Handle code submission logic here
    toast.success("Code submitted successfully");
    SETcode("");
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
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

      <Card>
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
        </CardContent>
      </Card>
    </div>
  );
}
