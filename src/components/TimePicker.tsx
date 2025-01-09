import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { TimeInput } from "@nextui-org/react";
import { Time } from "@internationalized/date";

import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogDescription
} from "./ui/dialog";

import { getPrettyDateString } from "@/lib/utils";

type props = { SETtime: Dispatch<SetStateAction<[number, number]>> };

export default function TimePicker({ SETtime }: props) {
  const [date, SETdate] = useState<Date | undefined>(new Date());
  const [startTime, SETstartTime] = useState(new Time(9, 0));
  const [endTime, SETendTime] = useState(new Time(17, 30));

  const submitTime = function () {
    const dateCpy = date;
    
    dateCpy?.setHours(startTime.hour);
    dateCpy?.setMinutes(startTime.minute);
    
    const startMillis = dateCpy?.getTime() || 0;
    
    dateCpy?.setHours(endTime.hour);
    dateCpy?.setMinutes(endTime.minute);
    
    const endMillis = dateCpy?.getTime() || 0;
    
    console.log(startMillis, endMillis);
    SETtime([startMillis, endMillis]);
  };
  
  useEffect(() => {
    submitTime();
  }, [submitTime])
  
  return (
    <Dialog>
      <DialogTrigger className="w-full flex gap-4 h-10">
        <div className="rounded-md h-10 grow flex items-center justify-start pl-3 transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          {getPrettyDateString(date, startTime, endTime)}
        </div>
        <div className="rounded-md h-10 w-10 flex items-center justify-center p-1 transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <CalendarCheck width={"full"} />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Select Meeting Time</DialogTitle>
        <DialogDescription hidden>Select Meeting Time</DialogDescription>
        <div className="flex justify-center items-center">
          <Calendar mode="single" selected={date} onSelect={SETdate} />
          <form
            action={submitTime}
            className="flex flex-col grow gap-4 h-full pt-12">
            <TimeInput
              onChange={(newTime) => SETstartTime(newTime)}
              defaultValue={startTime}
              label="Start Time"
              variant="bordered"
            />
            <TimeInput
              onChange={(newTime) => SETendTime(newTime)}
              defaultValue={endTime}
              label="End Time"
              variant="bordered"
            />
            <br />
            <br />
            <DialogClose className="w-full" asChild>
              <Button type="submit">Select Date</Button>
            </DialogClose>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
