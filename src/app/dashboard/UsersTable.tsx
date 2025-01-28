"use client";

import React, { memo, use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  SortDescriptor,
  Spinner,
  User
} from "@nextui-org/react";
import { Download, Plus } from "lucide-react";
import { NextUIProvider } from "@nextui-org/system";
import toast from "react-hot-toast";
import useSWRInfinite from "swr/infinite";

import useOnScreen from "@/lib/useOnScreen";
import { toLogged, unixToFancyDate } from "@/lib/utils";
import { getDocumentCount, getPage } from "./pagination";
import { getUserDataByID } from "../user/[userid]/utils";

type t_items = Exclude<Awaited<ReturnType<typeof getPage>>, null>;

const getKey = function (pageIndex: number, previousPageData: t_items) {
  return `http://localhost:3000/api/users?skip=${pageIndex * 20}`;
};

const dataFetcher = async function (url: string) {
  const { searchParams } = new URL(url);
  const skip = parseInt(searchParams.get("skip") || "0");

  console.log(skip);

  return getPage(skip).then((ret) => ret || []);
};

function UsersTable() {
  const [pageCount, SETpageCount] = useState(4);
  const [userCount, SETuserCount] = useState<null | number>(null);

  const [sortedItems, SETsortedItems] = useState<t_items>([]);
  const [sortDescriptor, SETsortDescriptor] = useState<SortDescriptor>({});

  const loaderRef = useRef<HTMLDivElement>(null);
  // const loaderVisible = useOnScreen(loaderRef);

  const router = useRouter();

  const { data, isLoading, setSize, size, isValidating } =
    useSWRInfinite<t_items>(getKey, (url) => dataFetcher(url), {
      initialSize: 0
    });

  let items = data?.flat() || [];

  useEffect(() => {
    getDocumentCount().then((res) => {
      SETpageCount(Math.ceil(res / 20));
      SETuserCount(res);
    });
  }, []);

  useEffect(() => {
    sorter(sortDescriptor);

    if (size >= pageCount) return;

    setSize((prev) => (prev < pageCount ? prev + 1 : prev));
  }, [data]);

  if (items[0]) {
    console.log(items[0].displayName, items[0].seconds);
  }

  const sorter = function (descriptor: SortDescriptor, data = items) {
    let newSortedItems = data;

    switch (descriptor.column) {
      case "hours":
        newSortedItems = (() => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => a.seconds - b.seconds);
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => b.seconds - a.seconds);
          }

          return data;
        })();
        break;

      case "meetings":
        newSortedItems = (() => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => a.meetingCount - b.meetingCount);
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => b.meetingCount - a.meetingCount);
          }

          return data;
        })();
        break;

      case "user":
        newSortedItems = (() => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => {
              if (!a.displayName || !b.displayName) return -1;
              return a.displayName.localeCompare(b.displayName);
            });
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => {
              if (!a.displayName || !b.displayName) return -1;
              return b.displayName.localeCompare(a.displayName);
            });
          }

          return data;
        })();
        break;

      case "lastCheckIn":
        newSortedItems = (() => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => a.lastCheckIn - b.lastCheckIn);
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => b.lastCheckIn - a.lastCheckIn);
          }

          return data;
        })();
        break;

      default:
        break;
    }

    SETsortedItems(newSortedItems);
    SETsortDescriptor(descriptor);
  };

  const onNameClicked = async function (e: React.Key) {
    const data = await getUserDataByID(e.toString());

    toast.loading(`Going to "${data?.displayName || "<NO NAME>"}"`, {
      duration: 2000
    });
    router.push(("/user/" + e) as string);
  };

  const generateCSV = function () {
    toast("All data isn't loaded ... please wait", {
      icon: "⚠️"
    });
    const loader = toast.loading("Generating CSV");

    const headers = Object.keys(items[0]);
    const rows = items.map((row) => Object.values(row));
    const csvData = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "data.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => toast.dismiss(loader), 1000);
  };

  return (
    <div className="relative h-full">
      <Table
        aria-label="Users Table"
        removeWrapper
        isHeaderSticky
        sortDescriptor={sortDescriptor}
        onSortChange={sorter}
        onRowAction={onNameClicked}>
        <TableHeader>
          <TableColumn key={"user"} allowsSorting>
            Users ({userCount ? userCount : " Loading ... "}, Loaded:{" "}
            {items.length})
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
        <TableBody {...{ isLoading, items: data?.flat() || [] }}>
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
                <TableCell>{(user.seconds / 60 / 60).toFixed(1)}</TableCell>
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
      {isValidating && (
        <div className="flex w-full justify-center border-none">
          <Spinner size="lg" ref={loaderRef} color="success" />
        </div>
      )}
      <div className="sticky bottom-0 flex justify-end items-end size-full">
        <Download
          className="hover:opacity-70 transition-all"
          onClick={generateCSV}
        />
      </div>
    </div>
  );
}

export default memo(UsersTable);
