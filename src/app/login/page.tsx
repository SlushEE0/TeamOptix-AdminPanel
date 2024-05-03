import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthStates, getCurrentUser, signIn_emailPass } from "@/lib/firebase";
import { validateSession } from "@/lib/session";
import PasswordBlock from "./PasswordVisibility";
// import ThirdPartyLogins from "./thirdparty";

export default async function LoginForm() {
  const is_validSession = await validateSession();
  const exists_currentUser = !!getCurrentUser();

  if (is_validSession && exists_currentUser) {
    redirect("/");
  } else if (is_validSession && !exists_currentUser) {
    //find way to delete cookie
  }

  const onFormSubmit = async function (formData: FormData) {
    "use server";

    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    console.log(email, password);

    const res = await signIn_emailPass(email, password);

    switch (res) {
      case AuthStates.AUTHORIZED:
        redirect("/");
        break;
      case AuthStates.UNAUTHORIZED:
        break;
      default:
        break;
    }
  };

  return (
    <main className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-5 xl:min-h-[800px]">
      <section className="flex items-center justify-center py-12 col-span-2">
        <div className="mx-auto grid w-[350px] gap-5 sm:translate-y-1/2 lg:translate-y-[-10%] xl:translate-y-[-30%]">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Login with admin account
            </p>
          </div>
          <form className="grid gap-4" action={onFormSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
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
              <div className="flex gap-2">
                <PasswordBlock />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button
              variant="outline"
              className="w-full p-0 flex justify-between">
              <img
                src="./googleLogo.svg"
                alt="google logo"
                className="h-full p-1"
              />
              <p className="mr-8">Login with Google</p>
              <div></div>
            </Button>
          </form>
        </div>
      </section>
      <section className="hidden bg-muted lg:block col-span-3">
        <Image
          src="/starryNight.svg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
        />
      </section>
    </main>
  );
}

// function Shennanigans() {
//   const DVD_SPEED = 2;

//   const [dvdData, SETdvdData] = useState({
//     x: 0,
//     y: 0,
//     invertedX: false,
//     invertedY: false
//   });
//   const [isDvdEnabled, SETisDvdEnabled] = useState(false);

//   const dvdLoop = function () {
//     let shouldInvertX = dvdData.invertedX;
//     let shouldInvertY = dvdData.invertedY;

//     if (dvdData.x + DVD_SPEED > window.innerWidth - 150 && !dvdData.invertedX) {
//       shouldInvertX = true;
//     }

//     if (
//       dvdData.y + DVD_SPEED > window.innerHeight - 280 &&
//       !dvdData.invertedY
//     ) {
//       shouldInvertY = true;
//     }

//     if (dvdData.x - DVD_SPEED < 0 && dvdData.invertedX) {
//       shouldInvertX = false;
//     }

//     if (dvdData.y - DVD_SPEED < 0 && dvdData.invertedY) {
//       shouldInvertY = false;
//     }

//     const deltaDvdY = (dvdData.invertedY ? -1 : 1) * DVD_SPEED;
//     const deltaDvdX = (dvdData.invertedX ? -1 : 1) * DVD_SPEED;

//     SETdvdData({
//       invertedX: shouldInvertX,
//       invertedY: shouldInvertY,
//       x: dvdData.x + deltaDvdX,
//       y: dvdData.y + deltaDvdY
//     });
//   };

//   if (isDvdEnabled) {
//     setTimeout(() => {
//       dvdLoop();
//     }, 100);
//   }

//   return (
//     <section>
//       <div
//         className="z-0 absolute w-[150px] h-min transition-500"
//         style={{
//           bottom: `${dvdData.y}px`,
//           left: `${dvdData.x}px`
//         }}
//         hidden={!isDvdEnabled}>
//         <img
//           src="/NoahSimon.jpeg"
//           width={150}
//           height={280}
//           className="rounded-xl border-2 border-primary"
//         />
//       </div>
//       <Button
//         className={
//           buttonVariants({ variant: "outline" }) + " absolute bottom-4 left-4"
//         }
//         onClick={() => SETisDvdEnabled(!isDvdEnabled)}>
//         Shennanigans
//       </Button>
//     </section>
//   );
// }
