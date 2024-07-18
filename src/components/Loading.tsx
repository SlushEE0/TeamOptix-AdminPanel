export default function Loading({ size = 24, border = 0.8 }) {
  return (
    <section className="size-full flex justify-center items-center border-none">
      <div
        className={`lds-ring text-purple-950 size-${size} *:absolute *:size-${size} *:border-[${border}rem] *:rounded-full *:border-[purple-950 transparent transparent transparent]`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </section>
  );
}
