import { getAllCodes, getAllUserData } from "@/lib/tableUtils";

import DataWrapper from "@/components/DataWrapper";

export default async function Page() {
  return (
    <>
      <DataWrapper
        initalCodesData={await getAllCodes()}
        initalUsersData={await getAllUserData()}
      />
    </>
  );
}
