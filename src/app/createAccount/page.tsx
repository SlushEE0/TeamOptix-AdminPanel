"use client";

import { useState } from "react";
import Link from "next/link";

import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AccountCreationStates } from "@/lib/types";
import { createAccount } from "./utils";

export default function CreateAccount() {
  const onFormSubmit = async function (formData: FormData) {
    const loader = toast.loading("Creating Account ...");

    const params = {
      email: formData.get("email")?.toString() || "",
      password: formData.get("password")?.toString() || "",
      confirmPassword: formData.get("confirmPassword")?.toString() || "",
      code: formData.get("code")?.toString() || "",
      name: formData.get("name")?.toString() || ""
    };

    if (params.code.length !== 5) {
      toast.dismiss(loader);
      toast.error("Invalid Creation Code");
      return;
    }

    if (params.password !== params.confirmPassword) {
      toast.dismiss(loader);
      toast.error("Passwords do not match");
      return;
    }

    const res = await createAccount(params);

    toast.dismiss(loader);
    switch (res) {
      case AccountCreationStates.SUCCESS:
        toast.success("Account Created Successfully");
        break;
      case AccountCreationStates.INVALID_CODE:
        toast.error("Invalid Creation Code");
        break;
      case AccountCreationStates.PASSWORD_MISMATCH:
        toast.error("Passwords do not match");
        break;
      case AccountCreationStates.IN_USE:
        toast.error(`Email: ${params.email} already in use`);
        break;
      case AccountCreationStates.ERROR:
        toast.error("An error occurred while creating account");
        break;
    }
  };

  return (
    <section className="size-full flex items-center justify-center">
      <Card className="p-7 pt-10 pb-10">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-balance text-muted-foreground">
              Make sure to enter Creation Code
            </p>
          </div>
          <form className="grid gap-4 z-10" action={onFormSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="code">Creation Code</Label>
              <Input name="code" type="text" placeholder="12abc" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input name="name" type="text" placeholder="Name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="email@example.com"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="flex gap-2">
                <div className="w-full grid gap-2">
                  <Input name="password" placeholder="Password" required />
                  <Input
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create
            </Button>
            <Button
              variant="outline"
              type="button"
              className="w-full p-0 flex justify-between"
              onClick={() =>
                toast.error("Sorry! This feature doesn't work yet.")
              }>
              <img
                src="./googleLogo.svg"
                alt="google logo"
                className="h-full p-1"
              />
              <p className="mr-8">Sign Up With Google</p>
              <div></div>
            </Button>
          </form>
        </div>
      </Card>
    </section>
  );
}
