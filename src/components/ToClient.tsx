"use client";

import { ReactNode } from "react";

export default function ToClient({ children }: { children: ReactNode }) {
  console.log("Im on the client");
  return children;
}
