"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export let is_passwordVisible: boolean = false;

type props = {
  name: string;
  defaultValue?: boolean;
  required?: boolean;
};

export default function PasswordBlock({
  name,
  defaultValue = false,
  required = true
}: props) {
  const [passwordVisible, SETpasswordVisible] = useState(defaultValue);

  return (
    <section className="flex gap-2">
      <Input
        name={name}
        type={passwordVisible ? "text" : "password"}
        required={required}
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
    </section>
  );
}
