import { signIn_emailPass } from "@/db/firebaseUtils";

export async function POST(req: Request) {
  const { email, pass }: { email: string; pass: string } = await req.json();

  const authState = await signIn_emailPass(email, pass);

  console.log(`[LOGIN] ${email} ${authState}`);

  return Response.json(authState);
}
