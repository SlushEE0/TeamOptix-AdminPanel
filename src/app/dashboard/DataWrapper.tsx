"use client";

import { Dispatch, SetStateAction, createContext, useState } from "react";

import { t_UserData, t_Code, With_id } from "@/lib/types";
import { deleteCode } from "@/app/dashboard/utils";

import UsersTable from "./UsersTable";
import CodesTable from "./CodesTable";
import DeleteCode from "./DeleteCode";
import CreateCode from "./CreateCode";
import CreateUser from "./CreateUser";

type CodesTableData = With_id<t_Code>[];
type UsersTableData = With_id<t_UserData>[];

export const CodesContext = createContext<
  [CodesTableData, Dispatch<SetStateAction<CodesTableData>>]
>(null as any);
export const UsersContext = createContext<
  [UsersTableData, Dispatch<SetStateAction<UsersTableData>>]
>(null as any);

type props = {
  initalCodesData: CodesTableData;
};

export default function DataWrapper({ initalCodesData }: props) {
  const [usersTableData, SETusersTableData] = useState<UsersTableData>([]);
  const [codesTableData, SETcodesTableData] =
    useState<CodesTableData>(initalCodesData);

  const deleteCodeAndRefetch = async function (value: string) {
    const deletedCode = await deleteCode(value);
    const deletedCodeIndex = codesTableData.findIndex((item) => {
      return item.value == deletedCode?.value;
    });

    SETcodesTableData((data) => data.toSpliced(deletedCodeIndex, 1));
  };

  return (
    <section className="bg-bg-light w-full h-full p-4 flex flex-wrap gap-3 justify-center overflow-x-hidden">
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
          <div className="border border-green-600 rounded-sm aspect-square h-full p-4">
            <CreateUser />
          </div>
        </section>
      </CodesContext.Provider>
    </section>
  );
}