"use client";

import { useEffect } from "react";

import { connect, disconnect } from "./utils";

/**
 * @description Used in layout.tsx. When mounted it connect to mongodb, and when unmounted, closes any connections.
 */
export function MongoClientConnection() {
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return (
    <div
      className="w-0 h-0 m-0 p-0 border-none bg-transparent"
      style={{ display: "none" }}></div>
  );
}
