import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type t_UserRecord = {
  uid: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  photoURL?: string;
  customClaims?: {
    [key: string]: any;
  };
  displayName: string;
};

export type t_UserData = {
  _id: string;
  uid: string;
  lastCheckIn: number;
  seconds: number;
  meetingCount: number;
};

export function unixToFancyDate(unixTime: number) {
  const date = new Date(unixTime);

  const months = [
    "bad boy",
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
