import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import React from "react";

// picks any icon for type checking
import type { AccessibilityIcon } from '@radix-ui/react-icons'

interface InitiativeProps {
  icon: typeof AccessibilityIcon
  title: string
  description: string
  cta?: CtaProps
}

export function Initiative({ title, description, cta, icon: Icon }: InitiativeProps) {
  return (
    <div className='w-full md:w-1/3 px-4 py-6'>
      <div className='h-full p-8 text-center hover:bg-coolGray-700 rounded-md hover:shadow-xl transition duration-200'>
        <div className='inline-flex h-16 w-16 mb-7 mx-auto items-center justify-center text-coolGray-900 bg-green-500 rounded-lg'>
          <Icon width={25} height={25} />
        </div>
        <h3 className='mb-3 text-xl md:text-2xl leading-tight text-white font-bold'>
          {title}
        </h3>
        <p className='text-coolGray-400 font-medium'>
          {description}
        </p>
        <p className='mt-8'>
          {cta ? <Cta {...cta}/> : <ComingSoon /> }
        </p>
      </div>
    </div>
  )
}

interface CtaProps {
  title: string
  url: string
}

function Cta({ title, url }: CtaProps) {
  return (
    <a
      className='py-3 px-4 leading-4 text-green-50 font-medium text-center bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-md shadow-sm'
      href={url}
    >
      {title}
    </a>
  )
}

function ComingSoon() {
  return (
    <span
      className='py-3 px-4 leading-4 text-green-50 font-medium text-center bg-green-400 rounded-md shadow-sm'
    >
      Coming Soon!
    </span>
  )
}
