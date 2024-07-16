import { Lexend } from "next/font/google";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
  return (
    <section
      className={
        "flex items-center justify-center flex-wrap size-full " +
        lexend.className
      }>
      <h1 className={"text-xl self-start " + lexendThick.className}>
        Create Code
      </h1>

      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select Code Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Type</SelectLabel>
            <SelectItem value="checkIn" className="cursor-pointer">
              Check In
            </SelectItem>
            <SelectItem value="checkOut" className="cursor-pointer">
              Check Out
            </SelectItem>
            <SelectItem value="attendanceOverride" className="cursor-pointer">
              Attendance Override
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </section>
  );
}
