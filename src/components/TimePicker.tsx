import { useState } from "react";
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
  DialogDescription,
  DialogHeader,
  DialogFooter
} from "./ui/dialog";

export default function TimePicker({}) {
  const [date, SETdate] = useState<Date | undefined>(new Date());
  const [startTime, SETstartTime] = useState(new Time(9, 0));
  const [endTime, SETendTime] = useState(new Time(17, 0));

  const getPrettyDateString = function () {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    if (!date) return "No Date Selected";

    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()} -- 12:00 AM - 1:00 PM`;
  };

  const submitTime = function() {
    const dateCpy = date;

    dateCpy?.setHours(startTime.hour);
    dateCpy?.setMinutes(startTime.minute);

    const startMillis = dateCpy?.getTime();

    dateCpy?.setHours(endTime.hour);
    dateCpy?.setMinutes(endTime.minute);

    const endMillis = dateCpy?.getTime();

    console.log(startMillis, endMillis);
  }

  return (
    <div className="w-full">
      <Dialog>
        <DialogTrigger className="w-full flex gap-4 h-10">
          <div className="border rounded-md h-10 grow flex items-center justify-start pl-3">
            {getPrettyDateString()}
          </div>
          <div className="border rounded-md h-10 w-10 flex items-center justify-center p-1">
            <CalendarCheck width={"full"} />
          </div>
        </DialogTrigger>
        <DialogContent>
          <div className="flex justify-center items-center">
            <Calendar mode="single" selected={date} onSelect={SETdate} />
            <div className="flex flex-col grow gap-4 h-full pt-12">
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
              <Button onClick={submitTime}>Select Date</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
