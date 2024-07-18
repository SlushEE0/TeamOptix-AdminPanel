"use client";

import { RefObject, useEffect, useMemo, useRef, useState } from "react";

export function useOnScreen(ref: RefObject<HTMLElement>) {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIntersecting(entry.isIntersecting)
      ),
    [ref]
  );

  useEffect(() => {
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return isIntersecting;
}

export default function App() {
  const ref = useRef<HTMLDivElement | null>(null);
  const isVisible = useOnScreen(ref);

  return (
    <>
      <div className="size-[120%] border-5 border-blue-600">scrollMe</div>
      <div className="size-full border-5 border-red-500">
        <div ref={ref} className="size-0">
          {isVisible
            ? null
            : (() => {
                console.log("off Screen");
                return null;
              })()}
        </div>
      </div>
    </>
  );
}
