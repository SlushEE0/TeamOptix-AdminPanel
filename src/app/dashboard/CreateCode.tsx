import { ChangeEvent, useContext, useState } from "react";
import toast from "react-hot-toast";
import { Lexend } from "next/font/google";
import { DatePicker, DateRangePicker } from "@nextui-org/react";
import { parseAbsolute } from "@internationalized/date";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";
import { t_CodeType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { createCode } from "./utils";
import { CodesContext } from "./DataWrapper";
import { getRandomTeam } from "@/lib/teamsLib";
import TimePicker from "@/components/TimePicker";

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

export default function CreateCode() {
  const [codeType, SETcodeType] = useState<t_CodeType | "pair">();
  const [codes, SETcodes] = useState({ code: "", code2: "" });
  const [allCodes, SETallCodes] = useContext(CodesContext);

  const [time, SETtime] = useState<[number, number]>([0, 0]);

  const onTypeChange = function (type: t_CodeType | "pair") {
    SETcodeType(type);
  };

  const onCreate = async function () {
    if (!codeType || !codes.code)
      return toast.error("Please enter valid code and type");

    const loader = toast.loading("Creating");

    if (codeType === "pair") {
      const doc = await createCode({
        key: "checkInPassword",
        value: codes.code,
        startTimeMS: time[0],
        endTimeMS: time[1]
      });
      const doc2 = await createCode({
        key: "checkOutPassword",
        value: codes.code2,
        startTimeMS: time[0],
        endTimeMS: time[1]
      });

      //_id will always be defined :)
      const id = doc as string;
      const id2 = doc2 as string;

      SETallCodes((curr) => {
        return [
          ...curr,
          {
            key: "checkInPassword",
            value: codes.code,
            _id: id,
            startTimeMS: time[0],
            endTimeMS: time[1]
          },
          {
            key: "checkOutPassword",
            value: codes.code2,
            _id: id2,
            startTimeMS: time[0],
            endTimeMS: time[1]
          }
        ];
      });
    } else {
      const doc = await createCode({
        key: codeType,
        value: codes.code,
        startTimeMS: time[0],
        endTimeMS: time[1]
      });

      const id = doc as string; // _id will always be defined :)

      SETallCodes((curr) => {
        return [
          ...curr,
          {
            key: codeType,
            value: codes.code,
            _id: id,
            startTimeMS: time[0],
            endTimeMS: time[1]
          }
        ];
      });
    }

    toast.remove(loader);
  };

  const onRandomize = function () {
    const team = getRandomTeam();

    switch (codeType) {
      case "pair":
        return SETcodes({
          code: team.name,
          code2: team.num.toString()
        });
      case "checkInPassword":
        return SETcodes((curr) => {
          return { ...curr, code: team.name };
        });
      case "checkOutPassword":
        return SETcodes((curr) => {
          return { ...curr, code: team.name };
        });
      case "attendanceOverride":
        return SETcodes((curr) => {
          return { ...curr, code: team.name };
        });
      default:
        toast.error("Select Code type");
    }
  };

  const onInput = function (e: ChangeEvent<HTMLInputElement>) {
    return SETcodes((curr) => {
      return {
        ...curr,
        code: e.target.value || ""
      };
    });
  };

  return (
    <section
      className={`flex items-center justify-center flex-wrap size-full ${lexend.className}`}>
      <h1 className={"text-xl self-start " + lexendThick.className}>
        Create Code
      </h1>

      <Dialog modal={false}>
        <DialogTrigger className="w-full h-[calc(100%-3rem)]">
          <div
            className={`bg-white w-full h-full text-lg  ${buttonVariants({
              variant: "default"
            })}`}>
            Create Code
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Options</DialogTitle>
            <DialogDescription>Create an attendance code</DialogDescription>
          </DialogHeader>
          <section
            aria-label="main-dialog"
            className="flex flex-wrap justify-center items-start gap-5">
            <Select onValueChange={onTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Code Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Type</SelectLabel>
                  <SelectItem
                    value="checkInPassword"
                    className="cursor-pointer">
                    Check In
                  </SelectItem>
                  <SelectItem
                    value="checkOutPassword"
                    className="cursor-pointer">
                    Check Out
                  </SelectItem>
                  <SelectItem
                    value="attendanceOverride"
                    className="cursor-pointer">
                    Attendance Override
                  </SelectItem>
                  <SelectItem value="pair" className="cursor-pointer">
                    Pair (Check In & Out)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <TimePicker {...{ SETtime }} />
            <div className="w-full flex gap-4">
              <Input
                data-main
                placeholder={codeType === "pair" ? "Check In" : "Code"}
                onChange={onInput}
                value={codes.code}
              />

              {codeType === "pair" && (
                <Input
                  placeholder="Check Out"
                  onChange={onInput}
                  value={codes.code2}
                />
              )}
            </div>
          </section>
          <DialogFooter className="flex justify-end w-full flex-nowrap">
            <Button className="w-3/5 mr-auto" onClick={onCreate}>
              Create
            </Button>
            <Button onClick={onRandomize}>Randomize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
