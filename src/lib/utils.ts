import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Time } from "@internationalized/date";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function unixToFancyDate(unixTime: number) {
  if (unixTime < 1000000) return "Unknown";
  const date = new Date(unixTime);

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

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getPrettyDateString(
  date: Date | undefined,
  startTime: Time,
  endTime: Time
) {
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
  if(date.getTime() < 1000000) return "No Date Selected";

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const startTimeStr = `${(startTime.hour % 12)
    .toString()
    .padStart(2, "0")}:${startTime.minute.toString().padStart(2, "0")} ${
    startTime.hour > 12 ? "PM" : "AM"
  }`;
  const endTimeStr = `${(endTime.hour % 12)
    .toString()
    .padStart(2, "0")}:${endTime.minute.toString().padStart(2, "0")} ${
    endTime.hour > 12 ? "PM" : "AM"
  }`;

  return `${month} ${day}, ${year} -- ${startTimeStr} - ${endTimeStr}`;
}
