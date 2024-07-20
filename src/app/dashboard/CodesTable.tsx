"use client";

import React, { memo, useContext, useEffect, useState } from "react";
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

import { CodesContext } from "./DataWrapper";

const lexend = Lexend({
  weight: "300",
  subsets: ["latin"],
  variable: "--font-sans"
});

function CodesTable() {
  const [sortDescriptor, SETsortDescriptor] = useState<SortDescriptor>({});
  const [tableData, SETtableData] = useState(useContext(CodesContext)[0]);
  const [allCodes, SETallCodes] = useContext(CodesContext);

  useEffect(() => {
    SETtableData(allCodes);
    sorter({});
  }, [allCodes]);

  const sorter = function (descriptor: SortDescriptor) {
    switch (descriptor.column) {
      case "value":
        SETtableData((data) => {
          if (descriptor.direction === "ascending") {
            return data.toSorted((a, b) => {
              if (!a.value || !b.value) return -1;
              console.log(a, b);

              return a.value.localeCompare(b.value);
            });
          } else if (descriptor.direction === "descending") {
            return data.toSorted((a, b) => {
              if (!a.value || !b.value) return -1;
              console.log(a, b);
              return b.value.localeCompare(a.value);
            });
          }

          return data;
        });
        return SETsortDescriptor(descriptor);

      case "key": {
        SETtableData((data) => {
          const types = [
            "attendanceOverride",
            "checkOutPassword",
            "checkInPassword"
          ];

          if (descriptor.direction === "ascending") {
            return data.toSorted(
              (a, b) => types.indexOf(a.key) - types.indexOf(b.key)
            );
          } else if (descriptor.direction === "descending") {
            return data.toSorted(
              (a, b) => types.indexOf(b.key) - types.indexOf(a.key)
            );
          }

          return data;
        });

        return SETsortDescriptor(descriptor);
      }

      default:
        return;
    }
  };

  return (
    <Table
      removeWrapper
      isHeaderSticky
      aria-label="OptixToolkit Users"
      sortDescriptor={sortDescriptor}
      onSortChange={sorter}>
      <TableHeader>
        <TableColumn key={"value"} allowsSorting>
          Code
        </TableColumn>
        <TableColumn key={"key"} allowsSorting className="text-right">
          Type
        </TableColumn>
      </TableHeader>
      <TableBody items={tableData}>
        {(item) => {
          return (
            <TableRow
              key={item._id}
              className="hover:bg-[#27272a] transition-all">
              <TableCell>{item.value}</TableCell>
              <TableCell className="text-right">{item.key}</TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}

export default memo(CodesTable);
