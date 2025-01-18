"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PresidentDVD from "./PresidentDVD";
import PasswordBlock from "../../components/PasswordBlock";

import { PRESIDENTS } from "@/lib/config";
import { AuthStates } from "@/lib/types";
import { fetcher } from "@/lib/utils";
import { validateAuth } from "./utils";
import { signIn_emailPass } from "@/db/firebaseUtils";

export default function LoginForm() {
  const [runDVD, SETrunDVD] = useState(false);

  const router = useRouter();

  // useEffect(() => {
  //   sessionCheck();
  // }, []);

  const onFormSubmit = async function (formData: FormData) {
    const email = formData.get("email")?.toString() || "";
    const pass = formData.get("password")?.toString() || "";

    let res: AuthStates = await fetcher("/api/login", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email, pass })
    });

    console.log(AuthStates.UNAUTHORIZED);
    switch (res) {
      case AuthStates.ADMIN_AUTHORIZED:
        // console.log("AUTHORIZED");
        toast.success("ADMIN! Authorized 🙂");
        toast.loading("Redirecting ...");
        router.push("/dashboard");
        break;
      case AuthStates.USER_AUTHORIZED:
        toast.success("USER! Authorized 🙂");
        toast.loading("Redirecting ...");
        router.push(`/toolkit`);
        break;
      case AuthStates.UNAUTHORIZED:
        // console.log("UNAUTHORIZED");
        toast.error("Unauthorized 😔");
        break;
      case AuthStates.ERROR:
        // console.log("ERROR");
        toast.error("An error occured :(", { duration: 20000 });
        break;
      default:
        console.log("NO USER");
        toast.error("Incorrect email/password");
        break;
    }

    // toast.remove(loader);
  };

  const onGsignIn = async function () {
    toast.error("Sorry, this feature is under construction");

    // const loader = toast.loading("Redirecting");
    // await signInWithRedirect(firebaseAuth, provider_google);
    // toast.dismiss(loader);
  };

  return (
    <main className="w-full lg:grid lg:grid-cols-2">
      <section className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
          </div>
          <form
            className="grid gap-4 z-10"
            onSubmit={() =>
              toast.loading("Authorizing ...", { duration: 1000 })
            }
            action={onFormSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input name="email" type="email" placeholder="m@example.com" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <PasswordBlock name="password" required />
            </div>
            <Button className="w-full">Login</Button>
            <Button
              variant="outline"
              type="button"
              className="w-full p-0 flex justify-between"
              onClick={onGsignIn}>
              <div className="aspect-square h-full p-1 flex justify-center items-center">
                <img
                  src="./googleLogo.svg"
                  alt="google logo"
                  className="relative"
                />
              </div>
              <p className="mr-8">Login with Google</p>
              <div></div>
            </Button>
          </form>
        </div>
      </section>
      <section className="hidden bg-muted lg:block h-screen">
        <Image
          src="/starryNight.svg"
          alt="Image"
          width={"1"}
          height={"1"}
          className="h-full w-full object-cover"
        />
      </section>
      {/* {PRESIDENTS.map((pres) => (
        <PresidentDVD imgPath={pres.imgPath} active={yes} key={pres.name} />
      ))} */}
      <PresidentDVD
        imgPath={"/presidents/NoahSimon.jpeg"}
        active={runDVD}
        startTuple={[2, 2, 1.4]}
      />
      <PresidentDVD
        imgPath={"/presidents/NoahSimon.jpeg"}
        active={runDVD}
        startTuple={[100, 500, 1]}
      />
      <Button
        className={"absolute bottom-4 right-4 text-gray-900"}
        variant={"ghost"}
        onClick={() => SETrunDVD((yes) => !yes)}>
        Shennanigans
      </Button>
    </main>
  );
}
