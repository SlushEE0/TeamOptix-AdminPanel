import { Suspense } from "react";
import { Lexend } from "next/font/google";

import "./globals.css";
import Loading from "./Loading";
import Toaster from "@/components/toast";

const lexend = Lexend({
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
    <html lang="en" className="dark">
      <body className={lexend.className + "bg-background w-full h-[100vh]"}>
        {Toaster[0]}
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </body>
    </html>
  );
}
