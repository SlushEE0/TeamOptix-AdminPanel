export default async function Loading() {
  return (
    <section className="size-full flex justify-center items-center border">
      <div className="lds-ring text-purple-950 size-24 *:absolute *:size-24 *:border-[0.8rem] *:rounded-full *:border-[purple-950 transparent transparent transparent]">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </section>
  );
}
