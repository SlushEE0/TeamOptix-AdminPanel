import { getUserDataByID } from "./utils";
import Actions from "./Actions";

export default async function UserPage({
  params
}: {
  params: { userid: string };
}) {
  const data = await getUserDataByID(params.userid);

  if (!data) {
    return (
      <h1 className="absolute translate-x--1/2 translate-y-1/2 left-1/2 top-1/2">
        No User Found
      </h1>
    );
  }

  return <Actions {...{ data }} />;
}
