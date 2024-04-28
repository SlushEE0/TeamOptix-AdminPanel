import { CompactTable } from "@table-library/react-table-library/compact";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import DashboardTable from "@/components/DashboardTable";

import { getMongoData } from "@/lib/mongo";
import { getUserDataWithUid } from "@/lib/firebase";
import { t_UserData, t_UserRecord, unixToFancyDate } from "@/lib/utils";

interface columnData extends t_UserData, t_UserRecord {}

const columns = [
  {
    label: "Name",
    renderCell: async (item: columnData) => {
      "use server";
      return item.displayName;
    }
  },
  {
    label: "Email",
    renderCell: async (item: columnData) => {
      "use server";
      return item.email;
    }
  },
  {
    label: "Hours",
    renderCell: async (item: columnData) => {
      "use server";
      return item.seconds / 1000 / 60 / 60;
    }
  },
  {
    label: "Meeting Count",
    renderCell: async (item: columnData) => {
      "use server";
      return item.meetingCount || "?";
    }
  },
  {
    label: "Last Check In",
    renderCell: async (item: columnData) => {
      "use server";
      return item.lastCheckIn ? unixToFancyDate(item.lastCheckIn) : "?";
    }
  }
];

export default async function Page() {
  const getUsers = async function () {
    return await getMongoData(async (db) => {
      return db.collection("users").find({}).toArray();
    });
  };

  const data = {
    nodes: (await getUsers())?.map(async (item: any) => {
      const userData = (await getUserDataWithUid(item.uid)) || {};

      return JSON.parse(
        JSON.stringify({
          ...userData,
          ...item,
          id: item["_id"]
        })
      );
    })
  };

  return (
    <section className="bg-bg-light size-full p-4">
      <section
        className="border sm:border-border lg:border-red-700 bg-background 
          rounded-sm h-full w-full min-w-[39rem] overflow-visible">
        <DashboardTable {...{ data, columns }} />
        {/* <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Meeting Count</TableHead>
              <TableHead className="text-right">Last Check In</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            
          </TableBody>
        </Table> */}
      </section>
    </section>
  );
}
