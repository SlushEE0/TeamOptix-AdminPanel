"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "./utils";
import { PasswordResetStates } from "@/lib/types";

export default function ForgotPassword() {
  const [email, SETemail] = useState("");

  const onReset = async function (e: React.FormEvent) {
    e.preventDefault();

    if (!email || typeof email !== "string")
      return toast.error("Please enter valid email");

    const loading = toast.loading("Generating Link...");
    const [state, link] = await resetPassword(email);
    toast.remove(loading);

    switch (state) {
      case PasswordResetStates.NO_ACCOUNT:
        toast.error("No account found with this email");
        break;

      case PasswordResetStates.SUCCESS:
        toast.success("You should be redirected in a few moments");
        window.open(link, "_blank");
        break;

      case PasswordResetStates.INVALID_EMAIL:
        return toast.error("Invalid Email");

      default:
        return toast.error("An error occurred");
    }
  };

  return (
    <section className="w-full">
      <section className="flex items-center justify-center py-12 col-span-2">
        <div className="mx-auto grid gap-5 w-80">
          <div className="flex flex-col items-center justify-center gap-5">
            <h1 className="text-3xl font-bold">Enter Email</h1>
            <br />
            <form onSubmit={onReset} className="flex flex-col gap-2 w-full">
              <Input
                placeholder="email"
                value={email}
                onChange={(e) => SETemail(e.target.value)}></Input>
              <Button type="submit">Reset</Button>
            </form>
          </div>
        </div>
      </section>
    </section>
  );
}
