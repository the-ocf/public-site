import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import React from "react";

export function Headshot({ image, name, title, link }: {
  image: StaticImport,
  name: string,
  title: string,
  link: string
}) {
  return <div className="flex flex-col items-center p-20">
    <Image
      src={image}
      alt={`${title} - ${name}`}
      width={200}
      height={200}
    ></Image>
    <h1 className="text-2xl text-center mt-6"><a href={link} target="_blank" className="underline text-blue-300">{title} - {name}</a></h1>
  </div>;
}
