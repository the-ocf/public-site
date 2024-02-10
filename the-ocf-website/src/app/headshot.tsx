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
    <div className='w-full md:w-1/2 lg:w-1/3 px-4 mb-12'>
      <div className='max-w-max'>
        <Image
          src={image}
          alt={`${title} - ${name}`}
          className='object-cover h-52 w-52 mb-2'
        />
        <h3 className='mb-1 text-3xl md:text-3xl leading-tight font-semibold'>
          {name}
        </h3>
        <div className='mb-2 text-lg font-medium text-green-500'>
          {title}
        </div>
        <div className='items-center'>
            <a className="inline-block text-coolGray-300 hover:text-coolGray-400" href={link}>
              <LinkedInLogoIcon width={22} height={22} />
            </a>
          </div>
      </div>
    </div>
  )
}
