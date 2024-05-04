"use client";

import { memo, useEffect, useState } from "react";
import { Lexend } from "next/font/google";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { t_CodesTableData } from "@/lib/types";

type props = {
  codes: t_CodesTableData[];
  deleteCode: (codeName: string, refetch: boolean) => any;
};

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

function DeleteCode({ codes, deleteCode }: props) {
  const [open, SETopen] = useState(false);
  const [value, SETvalue] = useState("");
  const [allCodes, SETallCodes] = useState([{ key: "", value: "" }]);
  const [allData, SETallData] = useState(codes);

  useEffect(() => {
    SETallCodes(
      allData.map((code) => {
        return { key: code.value.toLowerCase(), value: code.value };
      })
    );
  }, [allData]);

  return (
    <section
      className={
        "flex items-center justify-center flex-wrap size-full " +
        lexend.className
      }>
      <h1 className={"l text-xl " + lexendThick.className}>Delete Code</h1>
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
            <CommandEmpty>No code found.</CommandEmpty>
            <CommandGroup>
              {allCodes.map((code) => (
                <CommandItem
                  className={
                    "hover:bg-[#27272a] transition-all " + lexend.className
                  }
                  key={code.key}
                  value={code.value}
                  onSelect={(currentValue) => {
                    SETvalue(
                      currentValue === value
                        ? ""
                        : (allCodes.find((item) => item.key === currentValue)
                            ?.value as string)
                    );
                    SETopen(false);
                  }}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === code.key ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {code.value}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        variant={"destructive"}
        className="w-full"
        onClick={async () => {
          SETallData(await deleteCode(value, true));
          SETvalue("");
          SETopen(false);
        }}>
        Delete Code
      </Button>
    </section>
  );
}

export default memo(DeleteCode);
