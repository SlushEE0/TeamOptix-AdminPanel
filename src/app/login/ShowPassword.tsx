"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export let is_passwordVisible: boolean = false;

export default function PasswordBlock() {
  const [passwordVisible, SETpasswordVisible] = useState(false);

  is_passwordVisible = passwordVisible;

  return (
    <>
      <Input
        name="password"
        type={passwordVisible ? "text" : "password"}
        required
      />
      <Button
        variant={"secondary"}
        className="size-10 p-1.5"
        type="button"
        onClick={() => {
          SETpasswordVisible((curr) => !curr);
        }}>
        <Image
          src={passwordVisible ? "eye-invisible.svg" : "eye-visible.svg"}
          alt="Password Visibility"
          width={40}
          height={40}
          style={{
            filter:
              "invert(71%) sepia(100%) saturate(0%) hue-rotate(320deg) brightness(101%) contrast(103%)"
          }}
        />
      </Button>
    </>
  );
}
