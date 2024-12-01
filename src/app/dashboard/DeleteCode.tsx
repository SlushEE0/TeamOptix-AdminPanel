"use client";

import { memo, useContext, useState } from "react";
import { Lexend } from "next/font/google";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { CodesContext } from "./DataWrapper";
import { deleteCode } from "./utils";

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

function DeleteCode() {
  const [open, SETopen] = useState(false);
  const [value, SETvalue] = useState("");
  const [allCodes, SETallCodes] = useContext(CodesContext);

  const onDeleteCode = async function () {
    const deletedDoc = await deleteCode(value);

    SETallCodes((allCodes) =>
      allCodes.filter((code) => {
        if (code._id === deletedDoc?._id.toString()) return false;

        return true;
      })
    );

    SETvalue("");
    SETopen(false);
  };

  return (
    <section
      className={`flex items-center justify-center flex-wrap size-full ${lexend.className}`}>
      <h1 className={"self-start text-xl " + lexendThick.className}>
        Delete Code
      </h1>
      <Popover open={open} onOpenChange={SETopen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between">
            {value || "Select code..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search code..." />
            <CommandEmpty>No codes found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {allCodes?.map((code) => (
                  <CommandItem
                    className={
                      "hover:bg-[#27272a] transition-all " + lexend.className
                    }
                    key={code._id}
                    value={code.value}
                    onSelect={SETvalue}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === code.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {code.value}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Button variant={"destructive"} className="w-full" onClick={onDeleteCode}>
        Delete Code
      </Button>
    </section>
  );
}

export default memo(DeleteCode);

/**
 * 
 * onSelect={(currentValue) => {
                    SETvalue(
                      currentValue === value
                        ? ""
                        : (allCodes.find((item) => item.key === currentValue)
                            ?.value as string)
                    );
                    SETopen(false);
                  }}
 */
