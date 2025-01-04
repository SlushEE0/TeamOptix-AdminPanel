"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState
} from "react";
import toast from "react-hot-toast";

import { t_UserData, t_Code, With_id, t_Role } from "@/lib/types";
import { getAllCodes } from "@/app/dashboard/utils";

import UsersTable from "./UsersTable";
import CodesTable from "./CodesTable";
import DeleteCode from "./DeleteCode";
import CreateCode from "./CreateCode";

type CodesTableData = With_id<t_Code>[];
type UsersTableData = With_id<t_UserData>[];

export const CodesContext = createContext<
  [CodesTableData, Dispatch<SetStateAction<CodesTableData>>]
>(null as any);
export const UsersContext = createContext<
  [UsersTableData, Dispatch<SetStateAction<UsersTableData>>]
>(null as any);

export default function DataWrapper() {
  const [usersTableData, SETusersTableData] = useState<UsersTableData>([]);
  const [codesTableData, SETcodesTableData] = useState<CodesTableData>([]);

  useEffect(() => {
    toast.dismiss();

    (async () => {
      SETcodesTableData(await getAllCodes());
    })();
  }, []);

  return (
    <section className="w-screen h-screen">
      <div className="bg-bg-light w-full h-full p-4 flex flex-wrap gap-3 justify-center overflow-x-hidden">
        <CodesContext.Provider value={[codesTableData, SETcodesTableData]}>
          <section className="rounded-sm h-[calc(100%-16rem-1rem)] w-full grid grid-cols-3 grid-rows-1 gap-3 overflow-x-hidden">
            <UsersContext.Provider value={[usersTableData, SETusersTableData]}>
              <div className="lg:col-span-2 w-full max-h-full border overflow-scroll col-span-3 rounded-sm p-4 bg-background">
                <UsersTable />
              </div>
            </UsersContext.Provider>
            <div className="lg:col-span-1 lg:w-full h-full w-96 border rounded-sm p-4 bg-background">
              <CodesTable />
            </div>
          </section>
          <section className="w-full h-64 flex gap-4 bg-background border rounded-sm p-4">
            <div className="border border-green-600 rounded-sm aspect-square h-full p-4">
              <CreateCode />
            </div>
            <div className="border border-green-600 rounded-sm aspect-square h-full p-4">
              <DeleteCode />
            </div>
            {/* <div className="border border-green-600 rounded-sm aspect-square h-full p-4">
            <CreateUser />
          </div> */}
          </section>
        </CodesContext.Provider>
      </div>
    </section>
  );
}
