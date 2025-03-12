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
import { ArrayElement } from "mongodb";
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
  Tooltip,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  ChipProps
} from "@nextui-org/react";
import { Download, Eye, Pen, Pencil, Plus, Trash2 } from "lucide-react";
import { NextUIProvider } from "@nextui-org/system";
import toast from "react-hot-toast";
import useSWRInfinite from "swr/infinite";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import useOnScreen from "@/lib/useOnScreen";
import { toLogged, unixToFancyDate } from "@/lib/utils";
import { getDocumentCount, getPage } from "./pagination";
import { getUserDataByID } from "../user/[userid]/utils";
import { deleteUser } from "./utils";
import ModifyUserDialog from "./ModifyUserDialog";
import { useSWRConfig } from "swr";
import { parse } from "path";

type t_items = Exclude<Awaited<ReturnType<typeof getPage>>, null>;

const getKey = function (pageIndex: number, previousPageData: t_items) {
  return `${pageIndex * 20}`;
};

const dataFetcher = async function (skipStr: string) {
  const skip = parseInt(skipStr);

  return getPage(skip).then((ret) => ret || []);
};

let rendered = 0;

function UsersTable() {
  const [pageCount, SETpageCount] = useState(1);
  const [userCount, SETuserCount] = useState<null | number>(null);

  const [sortedItems, SETsortedItems] = useState<t_items>([]);
  const [sortDescriptor, SETsortDescriptor] = useState<SortDescriptor>({});

  const loaderRef = useRef<HTMLDivElement>(null);
  // const loaderVisible = useOnScreen(loaderRef);

  const router = useRouter();

  const { data, isLoading, setSize, size, isValidating, mutate } =
    useSWRInfinite<t_items>(getKey, (url) => dataFetcher(url), {
      initialSize: 0,
      revalidateFirstPage: false
    });

  let items = data?.flat() || [];

  useEffect(() => {
    getDocumentCount().then((res) => {
      SETpageCount(Math.ceil(res / 20));
      SETuserCount(res);
    });
    // const res = 20;
    // SETpageCount(Math.ceil(res / 20));
    // SETuserCount(res);
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

  const handleUserDelete = async function (user: ArrayElement<t_items>) {
    await deleteUser(user.uid);
  };

  const updateData = function (newObj: ArrayElement<t_items>) {
    let index = items.findIndex((item) => item._id === newObj._id);
    let key = Math.floor(index / 20);

    mutate((currData) => {
      const dataCpy = currData;
      const dataSel = dataCpy?.[key];

      if (!dataSel || !dataCpy) {
        toast.error("Failed to refresh table data");
        return currData;
      }

      const dataIndex = dataSel.findIndex((e) => e._id === newObj._id);
      dataCpy[key][dataIndex] = newObj;

      return dataCpy;
    });
  };

  const getChipColor = function (seconds: number): ChipProps["color"] {
    // 50 Hours is green
    // 40 hours is yellow
    // anything less is red

    const GREEN_HOURS = 50;
    const YELLOW_HOURS = 40;

    if (seconds + 500 >= GREEN_HOURS * 60 * 60) return "success";
    if (seconds + 500 >= YELLOW_HOURS * 60 * 60) return "warning";
    return "danger";
  };

  const renderCell = useCallback(
    (user: ArrayElement<t_items>) => {
      return (
        <TableRow key={user._id}>
          <TableCell>
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
            <div className="flex justify-center items-center flex-col pr-5">
              <Chip
                className="text-bold text-sm"
                color={getChipColor(user.seconds)}
                variant="flat">
                Hours: {user.seconds && (user.seconds / 60 / 60).toFixed(1)}
              </Chip>
              <p className="text-bold text-sm text-default-400">
                {user.meetingCount || 0} Meetings
              </p>
            </div>
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
              <ModifyUserDialog
                {...{
                  user,
                  updateData
                }}
              />
              <Dialog>
                <DialogTrigger>
                  <Tooltip color="danger" content="Delete User">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                      <Trash2 />
                    </span>
                  </Tooltip>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Are you sure you want to delete "
                      <span className="text-warning-500">
                        {user.displayName || "Unknown"}
                      </span>
                      " ?
                    </DialogTitle>
                    <DialogDescription>
                      Press the button to confirm
                    </DialogDescription>
                  </DialogHeader>
                  <section
                    aria-label="main-dialog"
                    className="flex size-full items-center justify-center">
                    <br />
                    <br />
                    <Button
                      onClick={() => handleUserDelete(user)}
                      className="w-full"
                      color="danger">
                      Confirm
                    </Button>
                  </section>
                </DialogContent>
              </Dialog>
            </div>
          </TableCell>
        </TableRow>
      );
    },
    [data, items]
  );

  return (
    <div className="relative h-full">
      <Table
        aria-label="Users Table"
        removeWrapper
        sortDescriptor={sortDescriptor}
        onSortChange={sorter}>
        <TableHeader>
          <TableColumn key={"user"} className="w-20" allowsSorting>
            {`Users (${userCount || " Loading ... "}, Loaded:
            ${items.length})`}
          </TableColumn>
          <TableColumn key={"hours"} align="center" allowsSorting>
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
