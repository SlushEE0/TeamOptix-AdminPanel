"use client";

import React, {
  Key,
  memo,
  use,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
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
  User,
  Tooltip
} from "@nextui-org/react";
import { Download, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { NextUIProvider } from "@nextui-org/system";
import toast from "react-hot-toast";
import useSWRInfinite from "swr/infinite";

import useOnScreen from "@/lib/useOnScreen";
import { toLogged, unixToFancyDate } from "@/lib/utils";
import { getDocumentCount, getPage } from "./pagination";
import { getUserDataByID } from "../user/[userid]/utils";
import { ArrayElement } from "mongodb";

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
  const [pageCount, SETpageCount] = useState(1);
  const [userCount, SETuserCount] = useState<null | number>(null);

  const [sortedItems, SETsortedItems] = useState<t_items>([]);
  const [sortDescriptor, SETsortDescriptor] = useState<SortDescriptor>({});

  const loaderRef = useRef<HTMLDivElement>(null);
  // const loaderVisible = useOnScreen(loaderRef);

  const router = useRouter();

  const { data, isLoading, setSize, size, isValidating } =
    useSWRInfinite<t_items>(getKey, (url) => dataFetcher(url), {
      initialSize: 0,
      revalidateFirstPage: false
    });

  let items = data?.flat() || [];

  useEffect(() => {
    // getDocumentCount().then((res) => {
    //   SETpageCount(Math.ceil(res / 20));
    //   SETuserCount(res);
    // });
  }, []);

  useEffect(() => {
    sorter(sortDescriptor);

    if (size >= pageCount) return;

    setSize((prev) => (prev < pageCount ? prev + 1 : prev));
  }, [data]);

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
    if (items.length === 0) {
      return toast.error("Data isnt loaded ... please wait");
    }

    let fileName = "data.csv";

    if (items.length !== userCount) {
      toast("All data isn't loaded ... please wait", {
        icon: "⚠️"
      });

      fileName = `${items.length}user-data.csv`;
    }

    const loader = toast.loading("Generating CSV");

    const headers = Object.keys(items[0]);
    const rows = items.map((row) => Object.values(row));
    const csvData = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => toast.dismiss(loader), 1000);
  };

  const renderCell = useCallback((user: ArrayElement<t_items>) => {
    console.log(user.photoURL);

    return (
      <TableRow key={user._id}>
        <TableCell className="w-min">
          <User
            avatarProps={{
              radius: "lg",
              src: user.photoURL,
              size: "md"
            }}
            description={user.email}
            name={user.displayName}
          />
        </TableCell>
        <TableCell className="flex flex-col">
          <strong className="text-bold text-sm capitalize">
            Hours: {user.seconds && (user.seconds / 60 / 60).toFixed(1)}
          </strong>
          <p className="text-bold text-sm capitalize text-default-400">
            {user.meetingCount || 0} Meetings
          </p>
        </TableCell>
        <TableCell>
          <p className="capitalize text-left">{user.role}</p>
        </TableCell>
        <TableCell align="center">
          <div className="relative flex items-center justify-center gap-3">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Eye />
              </span>
            </Tooltip>
            <Tooltip content="Edit user">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Pencil />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <Trash2 />
              </span>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
    );
  }, []);

  return (
    <div className="relative h-full">
      <Table
        aria-label="Users Table"
        removeWrapper
        
        sortDescriptor={sortDescriptor}
        onSortChange={sorter}
        onRowAction={onNameClicked}>
        <TableHeader>
          <TableColumn key={"user"} allowsSorting>
            {`Users (${userCount || " Loading ... "}, Loaded:
            ${items.length})`}
          </TableColumn>
          <TableColumn key={"hours"} allowsSorting>
            Build Season Hours
          </TableColumn>
          <TableColumn key={"role"} allowsSorting>
            Role
          </TableColumn>
          <TableColumn key={"actions"} align="center">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody {...{ isLoading, items: data?.flat() || [] }}>
          {renderCell}
        </TableBody>
      </Table>
      {isValidating && (
        <div className="flex w-full justify-center border-none">
          <Spinner size="lg" ref={loaderRef} color="success" />
        </div>
      )}
      <div className="sticky bottom-0 left-full flex justify-end items-end w-max">
        <Download
          className="hover:opacity-70 transition-all"
          onClick={generateCSV}
        />
      </div>
    </div>
  );
}

export default memo(UsersTable);
