import { Card } from "@/components/ui/card";

import Sidebar from "./Sidebar";
import { getUserDataByID } from "./utils";
import { unixToFancyDate } from "@/lib/utils";

export default async function UserPage({
  params
}: {
  params: { userid: string };
}) {
  const data = await getUserDataByID(params.userid);

  if (!data) {
    return (
      <h1 className="absolute translate-x--1/2 translate-y-1/2 left-1/2 top-1/2">
        No User Found
      </h1>
    );
  }

  return (
    <div className="flex justify-start items-start p-5 size-full">
      <Card className="h-full p-5 w-80">
        Hours: {(data.seconds / 1000 / 60 / 60).toFixed(4)}
        <br />
        Meeting Count: {data.meetingCount}
        <br />
        Last Check In: {unixToFancyDate(data.lastCheckIn)}
        <br />
        <br />
        Phone Number: {data.phoneNumber || "None"}
        <br />
        Email: {data.email}
        <br />
        <br />
        <h2>Role: {data.role}</h2>
      </Card>
      <Sidebar {...{ data }} />
    </div>
  );
}
