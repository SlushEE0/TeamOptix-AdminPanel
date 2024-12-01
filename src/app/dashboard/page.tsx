import { getAllCodes } from "@/app/dashboard/utils";

import DataWrapper from "@/app/dashboard/DataWrapper";

export default async function Page() {
  return (
    <DataWrapper
      initalCodesData={await getAllCodes()}
    />
  );
}
