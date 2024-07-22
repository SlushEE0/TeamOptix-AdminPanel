"use client";

import React, {
  memo,
  useCallback,
  useContext,
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
  User
} from "@nextui-org/react";
import { NextUIProvider } from "@nextui-org/system";

import useOnScreen from "@/lib/useOnScreen";
import { unixToFancyDate } from "@/lib/utils";
import { getPage, isLoadingFinished } from "./pagination";
import { UsersContext } from "./DataWrapper";
import toast from "react-hot-toast";

function UsersTable() {
  const [items, SETitems] = useContext(UsersContext);
  const [sortedItems, SETsortedItems] = useState(items);
  const [autoLoad, SETautoLoad] = useState(false);

  const [isLoading, SETisLoading] = React.useState(true);
  const [sortDescriptor, SETsortDescriptor] = useState<SortDescriptor>({});

  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderVisible = useOnScreen(loaderRef);

  const router = useRouter();

  const load = useCallback(async () => {
    const newItems = await getPage();

    SETitems((currItems) => {
      return [...currItems, ...newItems];
    });
    SETsortedItems((currItems) => {
      return [...currItems, ...newItems];
    });

    if (await isLoadingFinished(items.length)) {
      SETisLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loaderVisible) load();
  }, [loaderVisible, load]);

  useEffect(() => {
    sorter(sortDescriptor);
  }, [items]);

  const sorter = function (descriptor: SortDescriptor) {
    console.log(descriptor);

    switch (descriptor.column) {
      case "hours":
        SETsortedItems((data) => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => a.seconds - b.seconds);
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => b.seconds - a.seconds);
          }

          return data;
        });
        return SETsortDescriptor(descriptor);

      case "meetings":
        SETsortedItems((data) => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => a.meetingCount - b.meetingCount);
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => b.meetingCount - a.meetingCount);
          }

          return data;
        });
        return SETsortDescriptor(descriptor);

      case "user":
        SETsortedItems((data) => {
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
        SETsortedItems((data) => {
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
    const loader = toast.loading(`Redirecting`);
    router.push(("/user/" + e) as string);
    toast.remove(loader);
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
        onRowAction={onNameClicked}>
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
        <TableBody {...{ isLoading, items: sortedItems }}>
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
