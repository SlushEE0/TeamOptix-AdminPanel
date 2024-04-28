import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="size-full flex justify-center items-center">
      <div className="w-max h-min pr-4 border-r-2 border-primary">
        <h1 className="text-9xl relative bottom-2">404</h1>
      </div>
      <p className="text-2xl p-4 ">You aren't supposed to be here</p>
      <Link href="/" className="absolute bottom-3">
        <Button className="text-3xl" size={"lg"}>
          Return Home
        </Button>
      </Link>
    </section>
  );
}
