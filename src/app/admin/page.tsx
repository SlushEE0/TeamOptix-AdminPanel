"use client";

import { MongoPaginatedResults, mongo_rawRequest } from "@/lib/mongo";
import { useState } from "react";

export default async function Testing() {
  const [pageNum, SETpageNum] = useState(1);

  const paginatedData = new MongoPaginatedResults(
    (await mongo_rawRequest((client) => client.db())).ret,
    15
  );

  return (
    <button
      onClick={() => {
        console.log(paginatedData.getPage(pageNum));
        SETpageNum(pageNum + 1);
      }}></button>
  );
}
