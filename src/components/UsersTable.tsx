"use client";

import React, { memo, useState } from "react";
import { Lexend } from "next/font/google";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  SortDescriptor
} from "@nextui-org/table";

import { unixToFancyDate } from "@/lib/utils";
import { t_UsersTableData } from "@/lib/types";

const lexend = Lexend({
  weight: "300",
  subsets: ["latin"],
  variable: "--font-sans"
});

function UsersTable({ data }: { data: t_UsersTableData[] }) {
  const [sortDescriptor, SETsortDescriptor] = useState<SortDescriptor>();
  const [tableData, SETtableData] = useState(data);

  const sorter = function (descriptor: SortDescriptor) {
    console.log(descriptor);

    switch (descriptor.column) {
      case "hours":
        SETtableData((data) => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => a.seconds - b.seconds);
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => b.seconds - a.seconds);
          }

          return data;
        });
        return SETsortDescriptor(descriptor);

      case "meetings":
        SETtableData((data) => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => a.meetingCount - b.meetingCount);
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => b.meetingCount - a.meetingCount);
          }

          return data;
        });
        return SETsortDescriptor(descriptor);

      case "name":
        SETtableData((data) => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => {
              if (!a.displayName || !b.displayName) return -1;
              console.log(a, b);

              return a.displayName.localeCompare(b.displayName);
            });
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => {
              if (!a.displayName || !b.displayName) return -1;
              console.log(a, b);
              return b.displayName.localeCompare(a.displayName);
            });
          }

          return data;
        });
        return SETsortDescriptor(descriptor);

      case "lastCheckIn":
        SETtableData((data) => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => a.lastCheckIn - b.lastCheckIn);
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => b.lastCheckIn - a.lastCheckIn);
          }

          return data;
        });
        return SETsortDescriptor(descriptor);

      default:
        return;
    }
  };

  return (
    <Table
      removeWrapper
      aria-label="OptixToolkit Users"
      sortDescriptor={sortDescriptor}
      onSortChange={sorter}
      className={"overflow-y-scroll overflow-x-scroll h-full " + lexend.className}>
      <TableHeader>
        <TableColumn key={"name"} allowsSorting>
          Name
        </TableColumn>
        <TableColumn key={"email"}>Email</TableColumn>
        <TableColumn key={"hours"} allowsSorting>
          Hours
        </TableColumn>
        <TableColumn key={"meetings"} allowsSorting>
          Meeting Count
        </TableColumn>
        <TableColumn key={"lastCheckIn"} allowsSorting>
          Last Check In
        </TableColumn>
      </TableHeader>
      <TableBody items={tableData}>
        {(item) => {
          return (
            <TableRow
              key={item._id}
              className="hover:bg-[#27272a] transition-all">
              <TableCell>{item.displayName}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>
                {(item.seconds / 1000 / 60 / 60).toFixed(1)}
              </TableCell>
              <TableCell>{item.meetingCount}</TableCell>
              <TableCell>
                {item.lastCheckIn
                  ? unixToFancyDate(item.lastCheckIn)
                  : "Unknown"}
              </TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}

export default memo(UsersTable);
