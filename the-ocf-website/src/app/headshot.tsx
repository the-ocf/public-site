import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import React from "react";
import { LinkedInLogoIcon } from '@radix-ui/react-icons'

export function Headshot({ image, name, title, link }: {
  image: StaticImport,
  name: string,
  title: string,
  link: string
}) {
  return (
    <div className="w-full md:w-1/2 lg:w-1/3 px-4 mb-12">
      <div className="max-w-max mx-auto">
        <Image
          src={image}
          alt={`${title} - ${name}`}
          className='object-cover aspect-square block mb-8'
        />

        <h3 className="mb-2 text-3xl md:text-4xl leading-tight font-semibold">
          {name}
        </h3>

        <span className="text-lg font-medium text-green-500">
          {title}
        </span>

        <div className='mt-3 items-center'>
          <a className="inline-block text-coolGray-300 hover:text-coolGray-400" href={link}>
            <LinkedInLogoIcon width={22} height={22} />
          </a>
        </div>
      </div>
    </div>
  )
}
