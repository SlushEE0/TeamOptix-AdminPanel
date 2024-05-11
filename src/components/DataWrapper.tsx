"use client";

import { createContext, useEffect, useState } from "react";

import { t_CodesTableData, t_UsersTableData } from "@/lib/types";
import { deleteCode, getAllCodes, getAllUserData } from "@/lib/tableUtils";

import UsersTable from "./UsersTable";
import CodesTable from "./CodesTable";
import DeleteCode from "./DeleteCode";

export const CodesContext = createContext<t_CodesTableData[]>(null as any);
export const UsersContext = createContext<t_UsersTableData[]>(null as any);

type props = {
  initalCodesData: t_CodesTableData[];
  initalUsersData: t_UsersTableData[];
};

export default function DataWrapper({
  initalCodesData,
  initalUsersData
}: props) {
  const [usersTableData, SETusersTableData] =
    useState<t_UsersTableData[]>(initalUsersData);
  const [codesTableData, SETcodesTableData] =
    useState<t_CodesTableData[]>(initalCodesData);

  useEffect(() => {
    (async () => {
      SETusersTableData(await getAllUserData());
      // SETcodesTableData(await getAllUserData());
    })();
  }, []);

  const deleteCodeAndRefetch = async function (value: string) {
    const deletedCode = await deleteCode(value);
    const deletedCodeIndex = codesTableData.findIndex((item) => {
      item.value === deletedCode.value;
    });

    SETcodesTableData(codesTableData.toSpliced(deletedCodeIndex, 1));
  };

  return (
    <section className="bg-bg-light w-full h-full p-4 flex flex-wrap gap-3 justify-center borderoverflow-x-hidden overflow-y-auto">
      <CodesContext.Provider value={codesTableData}>
        <section className="rounded-sm max-h-full h-[calc(100%-16rem-1rem)] w-full grid grid-cols-3 gap-3">
          <UsersContext.Provider value={usersTableData}>
            <div className="fits-side:col-span-2 w-full border col-span-3 rounded-sm p-4 bg-background">
              <UsersTable data={usersTableData} />
            </div>
          </UsersContext.Provider>
          <div className="fits-side:col-span-1 fits-side:w-full h-full min-h-36 w-96 border rounded-sm p-4 bg-background">
            <CodesTable data={codesTableData} />
          </div>
        </section>
        <section className="w-full h-64 flex gap-4 bg-background border rounded-sm p-4">
          <div className="border border-green-600 rounded-sm aspect-square h-full p-4"></div>
          <div className="border border-green-600 rounded-sm aspect-square h-full p-4">
            <DeleteCode deleteCode={deleteCodeAndRefetch} />
          </div>
        </section>
      </CodesContext.Provider>
    </section>
  );
}
