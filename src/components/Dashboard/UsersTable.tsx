"use client";

import React, { memo, useState } from "react";
import { Lexend } from "next/font/google";

import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { Spinner } from "@nextui-org/spinner";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  SortDescriptor
} from "@nextui-org/table";
import { NextUIProvider } from "@nextui-org/system";

import { With_id, t_UserData } from "@/lib/types";
import { unixToFancyDate } from "@/lib/utils";

const lexend = Lexend({
  weight: "300",
  subsets: ["latin"],
  variable: "--font-sans"
});

function UsersTable({ data }: { data: With_id<t_UserData>[] }) {
  const [items, SETitems] = useState(data);

  const [isLoading, SETisLoading] = React.useState(true);
  const [sortDescriptor, SETsortDescriptor] = useState<SortDescriptor>();

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: isLoading,
    onLoadMore: load
  });

  async function load() {
    SETisLoading(false);
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

      case "name":
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

  return (
    <NextUIProvider>
      <Table
        removeWrapper
        isHeaderSticky
        sortDescriptor={sortDescriptor}
        onSortChange={sorter}
        baseRef={scrollerRef}
        bottomContent={
          isLoading ? (
            <div className="flex w-full justify-center border-none">
              <Spinner size="lg" ref={loaderRef} color="secondary" />
            </div>
          ) : null
        }
        className={`${lexend.className}`}>
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
        <TableBody isLoading={isLoading} items={items}>
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
    </NextUIProvider>
  );
}

export default memo(UsersTable);

{
  /*
   */
}
