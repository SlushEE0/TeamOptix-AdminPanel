import { redirect } from "next/navigation";

export default async function Page() {
  redirect("/dashboard");

  return (
    <section className="size-full flex justify-center items-center flex-wrap border">
      <h1 className="text-center w-full text-lg">You shouldn&apos;t be here</h1>

      <a href="/dashboard" className="p text-blue-600">
        Go to Dashboard
      </a>
    </section>
  );
}
