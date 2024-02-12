import React from "react";
import Matthew from "./headshots/matthew-bonig.png";
import Thorsten from "./headshots/thorsten-hoger.jpeg";
import Sebastian from './headshots/sebastian-korfmann.jpeg';
import Edwin from './headshots/edwin-radtke.jpeg';
import Matt from './headshots/matt-coulter.jpeg';
import Elad from './headshots/elad-ben-israel.jpeg';
import { Headshot } from "@/app/headshot";
import { CodeSandboxLogoIcon, ChatBubbleIcon, RocketIcon } from '@radix-ui/react-icons'
import patternWhite from './assets/pattern-white.svg'
import patternDark from './assets/pattern-dark.svg'
// import { TopNav } from './top-nav'

export default function Home() {
  return (
    <main id='content'>
      <section className='overflow-hidden'>
        <div
          className='relative bg-white overflow-hidden'
        >
          {/* <TopNav /> */}
          <div className='pt-12 pb-6 md:pb-12'>
            <div className='container px-4 mx-auto'>
              <div className='mx-auto text-center max-w-3xl'>
                <h1 className='mb-6 text-3xl md:text-5xl lg:text-5xl leading-tight font-bold tracking-tighter'>
                  The Open Construct Foundation
                </h1>
                <p className='mb-8 mx-auto text-lg md:text-xl text-coolGray-500 font-medium max-w-3xl'>
                  The Open Construct Foundation, founded in 2019, is a non-profit organization that plays a pivotal role in the AWS CDK ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className='py-24 md:py-28 bg-coolGray-900'
        style={{
          backgroundImage: `url("${patternDark.src}")`,
          backgroundPosition: 'center',
        }}
      >
        <div className='container px-4 mx-auto'>
          <div className='max-w-4xl mx-auto text-center'>
            <h2 className='mb-4 text-4xl md:text-5xl leading-tight text-white font-bold tracking-tighter'>
              Foundation Initiatives
            </h2>
            <p className='mb-20 text-lg md:text-xl text-coolGray-400 font-medium'>
              These initiatives foster collaboration, knowledge sharing, and the advancement of the CDK community.
            </p>
          </div>
          <div className='flex flex-wrap -mx-4'>
            <div className='w-full md:w-1/3 px-4'>
              <div className='h-full p-8 text-center hover:bg-coolGray-700 rounded-md hover:shadow-xl transition duration-200'>
                <div className='inline-flex h-16 w-16 mb-7 mx-auto items-center justify-center text-coolGray-900 bg-green-500 rounded-lg'>
                  <CodeSandboxLogoIcon width={25} height={25} />
                </div>
                <h3 className='mb-3 text-xl md:text-2xl leading-tight text-white font-bold'>
                  Community CDK Construct Library
                </h3>
                <p className='text-coolGray-400 font-medium'>
                  Simplify cloud development with constructs.
                  Find and use open-source Community Cloud Development Kit (CDK) construct libraries.
                </p>
                <p className='mt-8'>
                  <span
                    className='py-3 px-4 leading-4 text-green-50 font-medium text-center bg-green-400 rounded-md shadow-sm'
                  >
                    Coming Soon!
                  </span>
                </p>
              </div>
            </div>
            <div className='w-full md:w-1/3 px-4'>
              <div className='h-full p-8 text-center hover:bg-coolGray-700 rounded-md hover:shadow-xl transition duration-200'>
                <div className='inline-flex h-16 w-16 mb-7 mx-auto items-center justify-center text-coolGray-900 bg-green-500 rounded-lg'>
                  <ChatBubbleIcon width={25} height={25} />
                </div>
                <h3 className='mb-3 text-xl md:text-2xl leading-tight text-white font-bold'>
                  Community Slack Workspace
                </h3>
                <p className='text-coolGray-400 font-medium'>
                  Connect with the community of AWS CDK, CDK for Kubernetes (cdk8s) and CDK for Terraform (cdktf).
                </p>
                <p className='mt-8'>
                  <a
                    className='py-3 px-4 leading-4 text-green-50 font-medium text-center bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-md shadow-sm'
                    href='https://www.cdk.dev/'
                  >
                    Join Now
                  </a>
                </p>
              </div>
            </div>
            <div className='w-full md:w-1/3 px-4'>
              <div className='h-full p-8 text-center hover:bg-coolGray-700 rounded-md hover:shadow-xl transition duration-200'>
                <div className='inline-flex h-16 w-16 mb-7 mx-auto items-center justify-center text-coolGray-900 bg-green-500 rounded-lg'>
                  <RocketIcon width={25} height={25} />
                </div>
                <h3 className='mb-3 text-xl md:text-2xl leading-tight text-white font-bold'>
                  CDK Day Conference
                </h3>
                <p className='text-coolGray-400 font-medium'>
                  A small group of community members from across the globe thought this was something worth celebrating so we are going to take one day and showcase the brightest and best of CDK from across the whole product family.
                  Let&apos;s talk serverless, kubernetes and multi cloud all in the same day!
                </p>
                <p className='mt-8'>
                  <a
                    className='inline-block py-3 px-4 leading-4 text-green-50 font-medium text-center bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-md shadow-sm'
                    href='https://www.cdkday.com/'
                  >
                    Attend
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className='py-24 bg-white'
        style={{
          backgroundImage: `url("${patternWhite.src}")`,
          backgroundPosition: 'center',
        }}
      >
        <div className='container px-4 mx-auto'>
          <div className='flex flex-wrap items-center justify-between -mx-4 mb-16'>
            <div className='w-full md:w-1/2 px-4 mb-8 md:mb-0'>
              <div className='max-w-md'>
                <h3 className='mb-4 text-4xl md:text-5xl font-bold tracking-tighter'>
                  Who We Are
                </h3>
                {/* <p className='text-lg md:text-xl text-coolGray-500 font-medium'>
                      Tagline goes here...
                    </p> */}
              </div>
            </div>
          </div>

          <div className='flex flex-wrap -mx-4'>
            <Headshot
              title={"President"}
              name={"Thortsen Höger"}
              image={Thorsten}
              link={"https://www.linkedin.com/in/hoegertn/"}
            />
            <Headshot
              title={"Secretary"}
              name={"Sebastian Korfmann"}
              image={Sebastian}
              link={"https://www.linkedin.com/in/skorfmann/"}
            />
            <Headshot
              title={"Treasurer"}
              name={"Matthew Bonig"}
              image={Matthew}
              link={"https://www.linkedin.com/in/matthewbonig/"}
            />
            <Headshot
              title={"Board Member"}
              name={"Edwin Radtke"}
              image={Edwin}
              link={"https://www.linkedin.com/in/edwinrad/"}
            />
            <Headshot
              title={"Board Member"}
              name={"Matt Coulter"}
              image={Matt}
              link={"https://www.linkedin.com/in/nideveloper/"}
            />
            <Headshot
              title={"Board Member"}
              name={"Elad Ben-Israel"}
              image={Elad}
              link={"https://www.linkedin.com/in/hackingonstuff/"}
            />
          </div>
        </div>
      </section>
      <section
        className='bg-coolGray-900'
        style={{
          backgroundImage: `url("${patternDark.src}")`,
          backgroundPosition: 'center',
        }}
      >
        <div className='container px-4 mx-auto'>
          <div className='flex flex-wrap pt-24 pb-12 -mx-4'>
            <div className='w-full md:w-1/2 lg:w-4/12 px-4 mb-16 lg:mb-0'>
              <a className='inline-block mb-4' href='#'>
                {/* <img
                  className='h-8'
                  src='flex-ui-assets/logos/flex-ui-green.svg'
                  alt=''
                /> */}
              </a>
              <p className='text-base md:text-lg text-coolGray-400 font-medium lg:w-72 mb-2'>
                The Open Construct Foundation
              </p>
              <p className='text-base md:text-sm text-coolGray-400 lg:w-72'>
                A non-profit organization that plays a pivotal role in the AWS CDK ecosystem.
              </p>
            </div>
            {/* <div className='w-full md:w-1/4 lg:w-2/12 px-4 mb-16 lg:mb-0'>
              <h3 className='mb-5 text-lg font-bold text-white'>Product</h3>
              <ul>
                <li className='mb-4'>
                  <a
                    className='inline-block text-coolGray-400 hover:text-coolGray-500 font-medium'
                    href='#'
                  >
                    Features
                  </a>
                </li>
                <li className='mb-4'>
                  <a
                    className='inline-block text-coolGray-400 hover:text-coolGray-500 font-medium'
                    href='#'
                  >
                    Solutions
                  </a>
                </li>
                <li className='mb-4'>
                  <a
                    className='inline-block text-coolGray-400 hover:text-coolGray-500 font-medium'
                    href='#'
                  >
                    Pricing
                  </a>
                </li>
                <li className='mb-4'>
                  <a
                    className='inline-block text-coolGray-400 hover:text-coolGray-500 font-medium'
                    href='#'
                  >
                    Tutorials
                  </a>
                </li>
                <li>
                  <a
                    className='inline-block text-coolGray-400 hover:text-coolGray-500 font-medium'
                    href='#'
                  >
                    Updates
                  </a>
                </li>
              </ul>
            </div>
            <div className='w-full md:w-1/4 lg:w-2/12 px-4 mb-16 lg:mb-0'>
              <h3 className='mb-5 text-lg font-bold text-white'>Remaining</h3>
              <ul>
                <li className='mb-4'>
                  <a
                    className='inline-block text-coolGray-400 hover:text-coolGray-500 font-medium'
                    href='#'
                  >
                    Blog
                  </a>
                </li>
                <li className='mb-4'>
                  <a
                    className='inline-block text-coolGray-400 hover:text-coolGray-500 font-medium'
                    href='#'
                  >
                    Newsletter
                  </a>
                </li>
                <li className='mb-4'>
                  <a
                    className='inline-block text-coolGray-400 hover:text-coolGray-500 font-medium'
                    href='#'
                  >
                    Help Centre
                  </a>
                </li>
                <li className='mb-4'>
                  <a
                    className='inline-block text-coolGray-400 hover:text-coolGray-500 font-medium'
                    href='#'
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    className='inline-block text-coolGray-400 hover:text-coolGray-500 font-medium'
                    href='#'
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div className='w-full md:w-1/3 lg:w-4/12 px-4'>
              <h3 className='mb-5 text-lg font-bold text-white'>
                Newsletter
              </h3>
              <div className='flex flex-wrap'>
                <div className='w-full lg:flex-1 py-1 lg:py-0 lg:mr-3'>
                  <input
                    className='px-3 w-full h-12 text-coolGray-900 outline-none placeholder-coolGray-500 border border-coolGray-200 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-lg shadow-xsm'
                    placeholder='Your email'
                  />
                </div>
                <div className='w-full lg:w-auto py-1 lg:py-0'>
                  <a
                    className='inline-block py-4 px-5 w-full leading-4 text-green-50 font-medium text-center bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-md shadow-sm'
                    href='#'
                  >
                    Subscribe
                  </a>
                </div>
              </div>
            </div> */}
          </div>
        </div>
        <div className='border-b border-coolGray-800' />
        <p className='py-10 md:pb-16 text-sm text-coolGray-400 font-medium text-center'>
          &copy; 2019-{(new Date()).getFullYear()} The Open Construct Foundation
        </p>
      </section>
    </main>
  );
}
