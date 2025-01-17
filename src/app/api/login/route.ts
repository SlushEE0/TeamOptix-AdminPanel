import { signIn_emailPass } from "@/db/firebaseUtils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, pass }: { email: string; pass: string } = await req.json();

  const authState = await signIn_emailPass(email, pass);

  console.log(`[LOGIN] ${email} ${authState}`);
  const jwt = (await cookies()).get("session")?.value || "";

  const res = NextResponse.json(authState);
  res.cookies.set("session", jwt, {
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}
