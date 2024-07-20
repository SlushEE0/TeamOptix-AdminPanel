"use client";

import { Lexend } from "next/font/google";

const lexend = Lexend({
  weight: "300",
  subsets: ["latin"],
  variable: "--font-sans"
});

const lexendThick = Lexend({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans"
});

export default function CreateUser({}) {
  return (
    <section
      className={`flex items-center justify-center flex-wrap size-full ${lexend.className}`}>
      <h1 className={"text-xl self-start " + lexendThick.className}>
        Create User
      </h1>
    </section>
  );
}
