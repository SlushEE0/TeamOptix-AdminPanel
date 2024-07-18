export default async function Page() {
  return (
    <section className="size-full flex justify-center items-center flex-wrap border">
      <h1 className="text-center w-full text-lg">You shouldn't be here</h1>

      <a href="/dashboard" className="p text-blue-600">
        Go to Dashboard
      </a>
    </section>
  );
}
