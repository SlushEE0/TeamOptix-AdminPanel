"use client";

import { CompactTable } from "@table-library/react-table-library/compact";

export default function DashboardTable({
  data,
  columns
}: {
  data: any;
  columns: any;
}) {
  return <CompactTable {...{ data, columns }} />;
}
