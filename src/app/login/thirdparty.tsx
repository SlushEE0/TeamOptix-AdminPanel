// "use client";

// import { redirect } from "next/navigation";

// import { Button } from "@/components/ui/button";
// import { signIn_google } from "@/db/firebase";
// import { AuthStates } from "@/lib/types";

// export default function ThirdPartyLogins({ toast }: { toast: any }) {
//   const onSignInWithGoogle = function () {
//     const loadingToast = toast.loading("Logging In");

//     signIn_google().then((res) => {
//       toast.remove(loadingToast);

//       switch (res) {
//         case AuthStates.AUTHORIZED:
//           toast.success("You are authorized");
//           redirect("/dashboard");
//         case AuthStates.UNAUTHORIZED:
//           toast.error("You are unauthorized");
//           break;
//         default:
//           toast.error("Something went wrong");
//           break;
//       }
//     });
//   };

//   return (
//     <Button
//       className="w-12 h-12 p-1 border-2 border-border"
//       onClick={onSignInWithGoogle}
//       type="button">
//       <img
//         src="/googleLogo.svg"
//         width="100%"
//         height="100%"
//         className="rounded-md"
//       />
//     </Button>
//   );
// }
