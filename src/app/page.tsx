import "./homepage.css";
import { mongo_cursorToJSON, mongo_rawRequest, deleteCode, getCodesCol } from "@/lib/mongo";
import { getUserDataWithUid } from "@/lib/firebase";
import { t_CodesTableData, t_UserData } from "@/lib/types";

import UsersTable from "@/components/UsersTable";
import CodesTable from "@/components/CodesTable";
import DeleteCode from "@/components/DeleteCode";

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
    const ret = await getCodesCol();
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
    <section className="bg-bg-light w-full h-full p-4 flex flex-wrap gap-3 justify-center borderoverflow-x-hidden overflow-y-auto">
      <section className="rounded-sm max-h-full h-[calc(100%-16rem-1rem)] w-full grid grid-cols-3 gap-3">
        <div className="fits-side:col-span-2 w-full border col-span-3 rounded-sm p-4 bg-background">
          <UsersTable data={usersTableData} />
        </div>
        <div className="fits-side:col-span-1 fits-side:w-full h-full min-h-36 w-96 border rounded-sm p-4 bg-background">
          <CodesTable data={codesTableData} />
        </div>
      </section>
      <section className="w-full h-64 flex gap-4 bg-background border rounded-sm p-4">
        <div className="border border-green-600 rounded-sm aspect-square h-full p-4"></div>
        <div className="border border-green-600 rounded-sm aspect-square h-full p-4">
          <DeleteCode codes={codesTableData} deleteCode={deleteCode} />
        </div>
      </section>
    </section>
  );
}
