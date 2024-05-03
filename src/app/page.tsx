import dynamic from "next/dynamic";
import UsersTable from "@/components/UsersTable";

import { mongo_cursorToJSON, mongo_rawRequest } from "@/lib/mongo";
import { getUserDataWithUid } from "@/lib/firebase";
import { t_CodesTableData, t_UserData } from "@/lib/types";
import CodesTable from "@/components/CodesTable";

export default async function Page() {
  const getUsersCol = async function () {
    const ret = await mongo_rawRequest((client) => {
      return client.db().collection("users").find(
        {},
        {
          limit: 5
        }
      );
    });
    return mongo_cursorToJSON(ret.ret) as any as Promise<t_UserData[]>;
  };

  const getCodesTable = async function () {
    const ret = await mongo_rawRequest((client) => {
      return client.db().collection("settings").find({});
    });
    return mongo_cursorToJSON(ret.ret) as any as Promise<t_CodesTableData[]>;
  };

  const combineUserInfo = async function (data: t_UserData[]) {
    const usersCol = data;

    const promiseArr = await usersCol.map(async (item: t_UserData) => {
      const userData = (await getUserDataWithUid(item.uid)) || {};

      return { ...userData, ...item };
    });

    return Promise.all(promiseArr);
  };

  const usersTableData = await combineUserInfo(await getUsersCol());
  const codesTableData = await getCodesTable();

  return (
    <section className="bg-bg-light w-full h-full p-4 flex flex-wrap gap-6 justify-center overflow-x-hidden overflow-y-auto">
      <section
        className="border sm:border-border 2xl:border-red-700 bg-background 
          rounded-sm max-h-full max-w-[870px] min-w-0 p-5">
        <UsersTable data={usersTableData} />
      </section>
      <section
        className="w-96 max-h-full flex flex-wrap gap-5 flex-shrink-0 bg-background border sm:border-border
          rounded-sm p-5">
        <section className="w-full h-[calc(100%-15rem-1.25rem)] flex-grow border border-green-600 p-5 rounded-sm">
          <CodesTable data={codesTableData} />  
        </section>
        <section className="w-full h-60 border border-green-600 p-5 rounded-sm">
          Create/Delete Codes
        </section>
      </section>
      {/* <section
        className="w-96 max-h-full flex flex-wrap gap-5 flex-shrink-0 bg-background border sm:border-border
          rounded-sm p-5"></section> */}
    </section>
  );
}
