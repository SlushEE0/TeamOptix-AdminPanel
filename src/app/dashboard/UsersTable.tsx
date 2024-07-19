"use client";

import React, { memo, useContext, useEffect, useRef, useState } from "react";
import { Lexend } from "next/font/google";
import { useRouter } from "next/navigation";

import { Spinner } from "@nextui-org/spinner";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  SortDescriptor,
  User
} from "@nextui-org/react";
import { NextUIProvider } from "@nextui-org/system";

import { With_id, t_UserData } from "@/lib/types";
import { unixToFancyDate } from "@/lib/utils";
import { getDocumentCount, getPage } from "./pagination";

import useOnScreen from "@/lib/useOnScreen";
import { UsersContext } from "./DataWrapper";

const lexend = Lexend({
  weight: "300",
  subsets: ["latin"],
  variable: "--font-sans"
});

function UsersTable() {
  const [items, SETitems] = useContext(UsersContext);

  const [isLoading, SETisLoading] = React.useState(true);
  const [sortDescriptor, SETsortDescriptor] = useState<SortDescriptor>();

  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderVisible = useOnScreen(loaderRef);

  const router = useRouter();

  useEffect(() => {
    if (loaderVisible) load();
  }, [loaderVisible]);

  async function load() {
    const newItems = await getPage();

    SETitems((currItems) => {
      return [...currItems, ...newItems];
    });

    if ((await getDocumentCount()) === items.length) {
      SETisLoading(false);
    }
  }

  const sorter = function (descriptor: SortDescriptor) {
    console.log(descriptor);

    switch (descriptor.column) {
      case "hours":
        SETitems((data) => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => a.seconds - b.seconds);
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => b.seconds - a.seconds);
          }

          return data;
        });
        return SETsortDescriptor(descriptor);

      case "meetings":
        SETitems((data) => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => a.meetingCount - b.meetingCount);
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => b.meetingCount - a.meetingCount);
          }

          return data;
        });
        return SETsortDescriptor(descriptor);

      case "user":
        SETitems((data) => {
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
        SETitems((data) => {
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

  const onNameClicked = function (e: React.Key) {
    router.push(("/user/" + e) as string);
  };

  return (
    <NextUIProvider>
      <Table
        aria-label="Users Table"
        removeWrapper
        isHeaderSticky
        sortDescriptor={sortDescriptor}
        onSortChange={sorter}
        bottomContent={
          isLoading ? (
            <div className="flex w-full justify-center border-none">
              <Spinner size="lg" ref={loaderRef} color="success" />
            </div>
          ) : null
        }
        onRowAction={onNameClicked}
        className={`${lexend.className}`}>
        <TableHeader>
          <TableColumn key={"user"} allowsSorting>
            User
          </TableColumn>
          <TableColumn key={"hours"} allowsSorting>
            Build Season Hours
          </TableColumn>
          <TableColumn key={"meetings"} allowsSorting>
            Meeting Count
          </TableColumn>
          <TableColumn key={"lastCheckIn"} allowsSorting>
            Last Check In
          </TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} items={items}>
          {(user) => {
            return (
              <TableRow
                key={user._id}
                className="hover:bg-[#27272a] transition-all">
                <TableCell>
                  <User
                    avatarProps={{
                      radius: "sm",
                      src: user.photoURL,
                      size: "md"
                    }}
                    description={user.email}
                    name={user.displayName}
                  />
                </TableCell>
                <TableCell>
                  {(user.seconds / 1000 / 60 / 60).toFixed(1)}
                </TableCell>
                <TableCell>{user.meetingCount}</TableCell>
                <TableCell>
                  {user.lastCheckIn
                    ? unixToFancyDate(user.lastCheckIn)
                    : "Unknown"}
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </NextUIProvider>
  );
}

export default memo(UsersTable);
