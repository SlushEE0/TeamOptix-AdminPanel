"use client";

import Image from "next/image";

import { useState } from "react";

export default function Shennanigans({
  imgPath,
  active,
  startTuple
}: {
  imgPath: string;
  active: boolean;
  startTuple: [number, number, number];
}) {
  const DVD_SPEED = 4 * startTuple[2];

  const [dvdData, SETdvdData] = useState({
    x: startTuple[0],
    y: startTuple[1],
    invertedX: false,
    invertedY: false
  });

  const dvdLoop = function () {
    let shouldInvertX = dvdData.invertedX;
    let shouldInvertY = dvdData.invertedY;

    if (dvdData.x + DVD_SPEED > window.innerWidth - 150 && !dvdData.invertedX) {
      shouldInvertX = true;
    }

    if (
      dvdData.y + DVD_SPEED > window.innerHeight - 280 &&
      !dvdData.invertedY
    ) {
      shouldInvertY = true;
    }

    if (dvdData.x - DVD_SPEED < 0 && dvdData.invertedX) {
      shouldInvertX = false;
    }

    if (dvdData.y - DVD_SPEED < 0 && dvdData.invertedY) {
      shouldInvertY = false;
    }

    const deltaDvdY = (dvdData.invertedY ? -1 : 1) * DVD_SPEED;
    const deltaDvdX = (dvdData.invertedX ? -1 : 1) * DVD_SPEED;

    SETdvdData({
      invertedX: shouldInvertX,
      invertedY: shouldInvertY,
      x: dvdData.x + deltaDvdX,
      y: dvdData.y + deltaDvdY
    });
  };

  if (active) {
    setTimeout(() => {
      dvdLoop();
    }, 100);
  }

  return (
    <section
      hidden={!active}
      className="size-full p-0 m-0 bg-transparent absolute left-0 top-0">
      <div
        className="z-0 absolute w-[150px] h-min transition-500"
        style={{
          bottom: `${dvdData.y}px`,
          left: `${dvdData.x}px`
        }}
        hidden={!active}>
        <Image
          src={imgPath}
          alt="Img"
          width={150}
          height={280}
          className="rounded-xl border-2 border-primary"
        />
      </div>
    </section>
  );
}
