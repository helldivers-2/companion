import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Container from "@/components/containerCard";

export const metadata: Metadata = {
  title: "FAQ",
};

export default function FAQPage() {
  return (
    <>
      <Card className="mx-auto mb-10 max-w-xl border border-primary bg-muted">
        <CardHeader>
          <CardTitle>Helldivers War Status FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-neutral dark:prose-invert">
            <p>
              In Helldivers 2, Super Earth is in a Galactic War with the
              Automatons (robots) and the Terminids (bugs). During gameplay, you
              can choose to either attack the robots or the bugs. There are
              roughly 8-12 planets at any given time that you are allowed to
              play on, with the ultimate goal of liberating the planets and
              restoring democracy.
            </p>

            <p>
              The Galactic War status is global among all Helldivers players,
              and each and every Helldiver player victory contributes to
              liberating planets.
            </p>
            <p>
              This site shows all of the planets that you can play on at any
              given time, whether to Liberate or Defend the planet from an
              attack. In addition, it shows the current Liberation progress as
              well as an estimated time for the planet to be complete
            </p>
            <p>
              On the top of the site is a brief overview of the main movers in
              the Galactic War
            </p>
            <p>
              If you click on a planet in the table, you can see the history.
            </p>
            <p>
              On the map, there are pins for each active planet that includes
              its liberation status as well as the rate of liberation.
            </p>
          </div>
          <h1 className="mb-4 mt-8 text-2xl font-medium tracking-tighter">
            How does the math behind Liberation work?
          </h1>
          <div className="prose prose-neutral dark:prose-invert">
            <ul className="list-outside list-disc pl-4">
              <li>
                Each planet has an internal max HP. When attacking, the planet
                has 1000000. When defending, this varies from 600k-~2mil.
              </li>
              <li>
                Each planet regens HP, usually ranging from 1.5% to 4.5% per
                hour, but has been seen as high as 20% per hour. The game master
                can change these values at any time. NOTE - defense campaign
                doesn&apos;t regen hp, it is purely timer based
              </li>
              <li>
                Each Operation a Helldiver completes deals damage to the planet.
              </li>
              <li>
                The automatons can also drop a giant nuke on planets to deplete
                some liberation. This can be seen on planets such as{" "}
                <a href="/Planets/tien-kwan">Tien Kwan</a>. These drastic dips
                in liberation have been 1-2%, occuring as much as 5-10 times to
                keep Super Earth at bay.
              </li>
            </ul>
          </div>
          <div className="prose prose-neutral dark:prose-invert">
            <h1 className="mb-4 mt-8 text-2xl font-medium tracking-tighter">
              Does abandoning an operation negatively impact the %?
            </h1>
            <p>No, it does not.</p>
            <h1 className="mb-4 mt-8 text-2xl font-medium tracking-tighter">
              Why do all the planets seem to reset their status everyday?
            </h1>
            <p>
              Bugs and bots DO NOT sleep, they are constantly pushing back (hp
              regen). So overnight, when Americans (the biggest player base) are
              sleeping, the bugs and bots take back a lot of the planet. See the
              2nd bullet in how Liberation math works.
            </p>
            <h1 className="mb-4 mt-8 text-2xl font-medium tracking-tighter">
              What is the deal with &quot;Other Planets&quot;?
            </h1>
            <p>
              This is people who are playing the game as an individual, and are
              having very little impact to the galactic war. They are dealing
              less damage than the planet regens health, so it&apos;s constantly
              at full health. NOTE - the game master can account for this, so
              they aren&apos;t negatively impacting the userbase.
            </p>
            <h1 className="mb-4 mt-8 text-2xl font-medium tracking-tighter">
              What are supply lines/connections on the map?
            </h1>
            <p>
              Check out{" "}
              <a
                className="underline"
                href="https://reddit.com/r/Helldivers/comments/1b5u34s/galaxy_war_102_supply_lines_what_happens_to/"
              >
                this great guide
              </a>{" "}
              on Reddit.
            </p>
          </div>
        </CardContent>
      </Card>
      <Container title="System Requirements">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>MINIMUM</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-1">
                <strong>OS:</strong> Windows 10
              </p>
              <p className="mb-1">
                <strong>Processor:</strong> Intel Core i7-4790K or AMD Ryzen 5
                1500X
              </p>
              <p className="mb-1">
                <strong>Memory:</strong> 8 GB RAM
              </p>
              <p className="mb-1">
                <strong>Graphics:</strong> NVIDIA GeForce GTX 1050 Ti or AMD
                Radeon RX 470
              </p>
              <p className="mb-1">
                <strong>Storage:</strong> 100 GB available space
              </p>
              <p className="mb-1">64-bit processor required</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>RECOMMENDED</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-1">
                <strong>OS:</strong> Windows 10
              </p>
              <p className="mb-1">
                <strong>Processor:</strong> Intel Core i7-9700K or AMD Ryzen 7
                3700X
              </p>
              <p className="mb-1">
                <strong>Memory:</strong> 16 GB RAM
              </p>
              <p className="mb-1">
                <strong>Graphics:</strong> NVIDIA GeForce RTX 2060 or AMD Radeon
                RX 6600XT
              </p>
              <p className="mb-1">
                <strong>Storage:</strong> 100 GB available space
              </p>
              <p className="mb-1">
                <strong>Additional Notes:</strong> SSD Recommended
              </p>
              <p className="mb-1">64-bit processor required</p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
