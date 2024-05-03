"use client";

import React, { memo, useState } from "react";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  SortDescriptor
} from "@nextui-org/table";

import { t_CodesTableData } from "@/lib/types";

function CodesTable({ data }: { data: t_CodesTableData[] }) {
  const [sortDescriptor, SETsortDescriptor] = useState<SortDescriptor>();
  const [tableData, SETtableData] = useState(data);

  const sorter = function (descriptor: SortDescriptor) {
    console.log(descriptor);

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
      aria-label="OptixToolkit Users"
      sortDescriptor={sortDescriptor}
      onSortChange={sorter}
      className="overflow-y-scroll overflow-x-scroll h-full">
      <TableHeader>
        <TableColumn key={"value"} allowsSorting>
          Code
        </TableColumn>
        <TableColumn key={"key"} allowsSorting>
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
              <TableCell>{item.key}</TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}

export default memo(CodesTable);
