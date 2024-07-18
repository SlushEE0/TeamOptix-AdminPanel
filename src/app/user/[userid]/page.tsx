import { ObjectId, WithId } from "mongodb";

import { User } from "@nextui-org/react";

import { appendFBdata } from "@/app/dashboard/utils";
import { mongoReq, mongo_parseDocId } from "@/db/mongo";
import { t_MongoUserData } from "@/lib/types";
import Link from "next/link";

export default async function UserPage({
  params
}: {
  params: { userid: string };
}) {
  if (params.userid.length < 24)
    return (
      <h1 className="absolute text-center w-full translate-y-1/2 top-1/2">
        No User Found
      </h1>
    );

  const usingData = await mongoReq((db) => {
    return db
      .collection("users")
      .findOne<WithId<t_MongoUserData>>({ _id: new ObjectId(params.userid) });
  });

  if (!usingData.ret)
    return (
      <h1 className="absolute translate-x--1/2 translate-y-1/2 left-1/2 top-1/2">
        No User Found
      </h1>
    );

  const data = await appendFBdata(await mongo_parseDocId(usingData.ret));

  return (
    <section className="flex justify-start items-end p-5">
      <User
        description={
          <a
            href={`mailto:${data.email}`}
            target="_blank"
            className="text-blue-500">
            {data.email}
          </a>
        }
        avatarProps={{
          radius: "full",
          src: data.photoURL,
          size: "lg"
        }}
        name={data.displayName}></User>
    </section>
  );
}
