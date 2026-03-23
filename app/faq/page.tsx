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
    question: "Does abandoning an operation negatively impact liberation?",
    answer:
      "No. Abandoning an operation has no negative effect on a planet's liberation progress. Only completed missions deal damage to the planet's health pool.",
  },
  {
    question: "Why do planets seem to lose progress overnight?",
    answer:
      "Every planet regenerates health constantly, usually between 1.5% and 4.5% per hour. When the largest player base (North America) is asleep, fewer missions are completed but regeneration continues. The result is a visible dip in liberation by morning. Defense campaigns are the exception, they run on a fixed timer with no regeneration.",
  },
  {
    question: 'What does "Other Planets" mean on the dashboard?',
    answer:
      "This refers to players running missions on planets that aren't part of an active campaign. Their damage is real but typically too low to overcome the planet's health regeneration, so those planets stay at full health. The game master can account for this activity, so it doesn't hurt the war effort.",
  },
  {
    question: "What are supply lines on the galactic map?",
    answer:
      "Supply lines are connections between planets that determine which planets can be attacked next. Liberating a planet opens supply lines to its neighbors. Losing a planet can cut off access to others. The game master can also open or close supply lines manually to shape the war.",
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
          In Helldivers 2, Super Earth fights a Galactic War against the
          Automatons (robots), the Terminids (bugs), and the Illuminate. During
          gameplay you choose which front to fight on. Active campaigns rotate
          over time, driven by a game master at Arrowhead who shapes the war in
          real time.
        </p>

        <p>
          The Galactic War is shared across all players. Every completed mission
          chips away at a planet&apos;s health pool, pushing it toward
          liberation. This site tracks that progress, active campaigns,
          liberation percentages, and estimated completion times.
        </p>

        <p>
          On the dashboard, each planet card shows its current liberation
          status. The map displays pins for active planets with their liberation
          rate.
        </p>
      </div>

      <h3 className="mt-8 mb-4 text-2xl font-medium tracking-tighter">
        How does liberation math work?
      </h3>

      <ul className="list-outside list-disc space-y-2 pl-4">
        <li>
          Each planet has an internal max HP. Attacking planets have a fixed
          pool of 1,000,000. Defense campaigns vary from roughly 600k to over 2
          million.
        </li>
        <li>
          Planets regenerate HP constantly, usually 1.5% to 4.5% per hour,
          though the game master can push this as high as 20%. Defense campaigns
          are timer-based and do not regenerate.
        </li>
        <li>
          Each completed operation deals damage to the planet. More players on a
          planet means faster liberation.
        </li>
        <li>
          Enemy factions can also launch attacks that drain liberation progress.
          These show up as sudden dips of 1–2%, sometimes occurring multiple
          times in succession to stall Super Earth&apos;s advance.
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
          <h3 className="mb-2 text-2xl font-medium tracking-tighter">
            {item.question}
          </h3>
          <p className="text-muted-foreground">{item.answer}</p>
        </div>
      ))}

      <div className="border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Answers compiled from{" "}
          <a
            className="underline hover:text-primary"
            href="https://helldivers.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            helldivers.io
          </a>{" "}
          and community sources.
        </p>
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
        <p className="text-muted-foreground">{requirements.notes}</p>
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

      <Container title="PC System Requirements" discussion="FAQ">
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Per Steam store listing. Also available on PlayStation 5.
        </p>
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
