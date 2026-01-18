import type { Metadata } from "next";
import Container from "@/components/container";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "How do liberations or abandoning work? What system requirements does the game have?",
};

const faqItems = [
  {
    question: "Does abandoning an operation negatively impact the %?",
    answer: "No, it does not.",
  },
  {
    question: "Why do all the planets seem to reset their status everyday?",
    answer:
      "Bugs and bots DO NOT sleep, they are constantly pushing back (hp regen). So overnight, when Americans (the biggest player base) are sleeping, the bugs and bots take back a lot of the planet. See the 2nd bullet in how Liberation math works.",
  },
  {
    question: 'What is the deal with "Other Planets"?',
    answer:
      "This is people who are playing the game as an individual, and are having very little impact to the galactic war. They are dealing less damage than the planet regens health, so it's constantly at full health. NOTE - the game master can account for this, so they aren't negatively impacting the userbase.",
  },
  {
    question: "What are supply lines/connections on the map?",
    answer: {
      text: "Check out this great guide on Reddit.",
      link: {
        url: "https://reddit.com/r/Helldivers/comments/1b5u34s/galaxy_war_102_supply_lines_what_happens_to/",
        text: "this great guide",
      },
    },
  },
];

interface BaseSystemRequirements {
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
  notes: string;
}

interface RecommendedSystemRequirements extends BaseSystemRequirements {
  additionalNotes: string;
}

const systemRequirements = {
  minimum: {
    os: "Windows 10",
    processor: "Intel Core i7-4790K or AMD Ryzen 5 1500X",
    memory: "8 GB RAM",
    graphics: "NVIDIA GeForce GTX 1050 Ti or AMD Radeon RX 470",
    storage: "100 GB available space",
    notes: "64-bit processor required",
  } satisfies BaseSystemRequirements,
  recommended: {
    os: "Windows 10",
    processor: "Intel Core i7-9700K or AMD Ryzen 7 3700X",
    memory: "16 GB RAM",
    graphics: "NVIDIA GeForce RTX 2060 or AMD Radeon RX 6600XT",
    storage: "100 GB available space",
    additionalNotes: "SSD Recommended",
    notes: "64-bit processor required",
  } satisfies RecommendedSystemRequirements,
};

function LiberationMechanics() {
  return (
    <div className="rounded-none border bg-background p-4">
      <div className="space-y-4">
        <p>
          In Helldivers 2, Super Earth is in a Galactic War with the Automatons
          (robots) and the Terminids (bugs). During gameplay, you can choose to
          either attack the robots or the bugs. There are roughly 8-12 planets
          at any given time that you are allowed to play on, with the ultimate
          goal of liberating the planets and restoring democracy.
        </p>

        <p>
          The Galactic War status is global among all Helldivers players, and
          each and every Helldiver player victory contributes to liberating
          planets.
        </p>

        <p>
          This site shows all of the planets that you can play on at any given
          time, whether to Liberate or Defend the planet from an attack. In
          addition, it shows the current Liberation progress as well as an
          estimated time for the planet to be complete
        </p>

        <p>
          On the top of the site is a brief overview of the main movers in the
          Galactic War
        </p>

        <p>If you click on a planet in the table, you can see the history.</p>

        <p>
          On the map, there are pins for each active planet that includes its
          liberation status as well as the rate of liberation.
        </p>
      </div>

      <h3 className="mt-8 mb-4 text-2xl font-medium tracking-tighter">
        How does the math behind Liberation work?
      </h3>

      <ul className="list-outside list-disc space-y-2 pl-4">
        <li>
          Each planet has an internal max HP. When attacking, the planet has
          1000000. When defending, this varies from 600k-~2mil.
        </li>
        <li>
          Each planet regens HP, usually ranging from 1.5% to 4.5% per hour, but
          has been seen as high as 20% per hour. The game master can change
          these values at any time. NOTE - defense campaign doesn&apos;t regen
          hp, it is purely timer based
        </li>
        <li>
          Each Operation a Helldiver completes deals damage to the planet.
        </li>
        <li>
          The automatons can also drop a giant nuke on planets to deplete some
          liberation. This can be seen on planets such as{" "}
          <a
            href="/Planets/tien-kwan"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Tien Kwan
          </a>
          . These drastic dips in liberation have been 1-2%, occuring as much as
          5-10 times to keep Super Earth at bay.
        </li>
      </ul>
    </div>
  );
}

function FAQSection() {
  return (
    <div className="space-y-6 rounded-none border bg-background p-4">
      {faqItems.map((item, index) => (
        <div key={index}>
          <h3 className="mb-4 text-2xl font-medium tracking-tighter">
            {item.question}
          </h3>
          {typeof item.answer === "string" ? (
            <p>{item.answer}</p>
          ) : (
            <p>
              Check out{" "}
              <a
                className="text-blue-600 underline hover:text-blue-800"
                href={item.answer.link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.answer.link.text}
              </a>{" "}
              on Reddit.
            </p>
          )}
        </div>
      ))}

      <div className="border-t pt-4">
        <a
          className="text-sm text-muted-foreground underline hover:text-primary"
          href="https://helldivers.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source
        </a>
      </div>
    </div>
  );
}

function SystemRequirementsCard({
  title,
  requirements,
}: {
  title: string;
  requirements: BaseSystemRequirements | RecommendedSystemRequirements;
}) {
  const isRecommended = "additionalNotes" in requirements;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p>
          <strong>OS:</strong> {requirements.os}
        </p>
        <p>
          <strong>Processor:</strong> {requirements.processor}
        </p>
        <p>
          <strong>Memory:</strong> {requirements.memory}
        </p>
        <p>
          <strong>Graphics:</strong> {requirements.graphics}
        </p>
        <p>
          <strong>Storage:</strong> {requirements.storage}
        </p>
        {isRecommended && (
          <p>
            <strong>Additional Notes:</strong>{" "}
            {(requirements as RecommendedSystemRequirements).additionalNotes}
          </p>
        )}
        <p>{requirements.notes}</p>
      </CardContent>
    </Card>
  );
}

export default function FAQPage() {
  return (
    <>
      <Container title="Frequently Asked Questions" className="mb-4 lg:mb-8">
        <div className="grid gap-8 md:grid-cols-2">
          <LiberationMechanics />
          <FAQSection />
        </div>
      </Container>

      <Container
        title="What are the best specifications for the game Helldivers 2?"
        discussion="FAQ"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <SystemRequirementsCard
            title="MINIMUM"
            requirements={systemRequirements.minimum}
          />
          <SystemRequirementsCard
            title="RECOMMENDED"
            requirements={systemRequirements.recommended}
          />
        </div>
      </Container>
    </>
  );
}
