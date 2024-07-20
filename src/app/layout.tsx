import { Suspense } from "react";
import { Open_Sans } from "next/font/google";

import { Toaster } from "react-hot-toast";

import "./globals.css";
import { MongoClientConnection } from "@/components/mongo/MongoClientConnection";

const openSans = Open_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata = {
  title: "OptixToolkit Admin Panel",
  description: "Team Optix 3749's member management dashboard"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${openSans.className} dark`}>
      <body className={"bg-background w-full h-[100vh]"}>
        {children}
        <Toaster position="bottom-right" />
        <MongoClientConnection />
      </body>
    </html>
  );
}
