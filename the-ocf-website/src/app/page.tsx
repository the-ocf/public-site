import React from "react";
import Matthew from "./headshots/matthew-bonig.png";
import Thorsten from "./headshots/thorsten-hoger.jpeg";
import Sebastian from './headshots/sebastian-korfmann.jpeg';
import Edwin from './headshots/edwin-radtke.jpeg';
import Matt from './headshots/matt-coulter.jpeg';
import Elad from './headshots/elad-ben-israel.jpeg';
import { Headshot } from "@/app/headshot";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center  p-24">

      <div
        className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <h1 className="text-6xl">The Open Construct Foundation</h1>
      </div>

      <div className="pt-32">
        <h1 className="text-4xl text-center underline">What Is It?</h1>
        <p className="text-2xl p-20">The Open Construct Foundation, founded in 2019, is a non-profit organization that
          plays a pivotal role in the AWS CDK ecosystem.
          In addition to launching the community-driven CDK construct library,
          the foundation also manages the <a href="https://cdk.dev" target="_blank"
                                             className="underline text-blue-400">cdk.dev</a> Slack
          workspace and organizes the <a href="https://cdkday.com" target="_blank" className="underline text-blue-400">CDK
            Day conference</a>.
          These initiatives foster collaboration, knowledge sharing, and the advancement of the CDK community. </p>
      </div>

      <div className="pt-32">
        <h1 className="text-4xl text-center underline">Who We Are</h1>
        <Headshot title={"President"}
                  name={"Thortsen Höger"}
                  image={Thorsten}
                  link={"https://www.linkedin.com/in/hoegertn/"}
        ></Headshot>
        <Headshot title={"Secretary"}
                  name={"Sebastian Korfmann"}
                  image={Sebastian}
                  link={"https://www.linkedin.com/in/skorfmann/"}
        ></Headshot>
        <Headshot title={"Treasurer"}
                  name={"Matthew Bonig"}
                  image={Matthew}
                  link={"https://www.linkedin.com/in/matthewbonig/"}
        ></Headshot>
        <Headshot title={"Board Member"}
                  name={"Edwin Radtke"}
                  image={Edwin}
                  link={"https://www.linkedin.com/in/edwinrad/"}
        ></Headshot>
        <Headshot title={"Board Member"}
                  name={"Matt Coulter"}
                  image={Matt}
                  link={"https://www.linkedin.com/in/nideveloper/"}
        ></Headshot>
        <Headshot title={"Board Member"}
                  name={"Elad Ben-Israel"}
                  image={Elad}
                  link={"https://www.linkedin.com/in/hackingonstuff/"}
        ></Headshot>
      </div>
    </main>
  );
}
