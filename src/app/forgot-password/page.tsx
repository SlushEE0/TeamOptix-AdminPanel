"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPassResetLink } from "./utils";

export default function ForgotPassword() {
  const [email, SETemail] = useState("");

  const onReset = async function () {
    if (!email || typeof email !== "string")
      return toast.error("Please enter valid email");

    const loading = toast.loading("Generating Link...");
    const link = await getPassResetLink(email);
    toast.remove(loading);

    if (!link) return toast.error("No account found with this email");

    toast.success("You should be redirected in a few moments");

    window.open(link, "_blank");
  };

  return (
    <section className="w-full">
      <section className="flex items-center justify-center py-12 col-span-2">
        <div className="mx-auto grid w-[450px] gap-5">
          <div className="grid gap-2 text-center grid-rows-5">
            <h1 className="text-3xl font-bold grid-rows-1">
              Enter Admin Account Email
            </h1>
            <br />
            <Input
              className="w-52 translate-x-1/2 right-1/2"
              placeholder="email"
              value={email}
              onChange={(e) => SETemail(e.target.value)}></Input>
            <Button
              className="w-52 translate-x-1/2 right-1/2"
              onClick={onReset}>
              Reset
            </Button>
          </div>
        </div>
      </section>
      <section className="hidden bg-muted lg:block col-span-3"></section>
      <a href="/login" className="absolute left-1 top-1">
        <Button variant={"outline"}>Back to Login</Button>
      </a>
    </section>
  );
}
