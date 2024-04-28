"use client";
import { useState } from "react";

export default function Toaster() {
  const [isHidden, SETisHidden] = useState(false);
  const toaster = useToaster();

  return [
    <section
      className="absolute bg-red-500 w-20 h-10 top-2 left-1/2"
      hidden={isHidden}>
      <h1>{toaster[0]}</h1>
    </section>,
    toaster
  ] as const;
}

function useToaster() {
  const [toast, SETtoast] = useState('Data');

  return [toast, SETtoast] as const
}
