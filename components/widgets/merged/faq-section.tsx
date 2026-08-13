import Container from "@/components/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqItems = [
  {
    question: "Does abandoning an operation hurt liberation?",
    answer:
      "No. Only completed missions damage a planet's health pool, so dropping an operation costs you the rewards and nothing else.",
  },
  {
    question: "Why do planets lose progress overnight?",
    answer:
      "Planets regenerate health around the clock, usually 1.5% to 4.5% per hour. Overnight, when fewer Helldivers are dropping, that regeneration outruns the damage players deal and you wake up to a lower percentage. Defense campaigns work differently: they run on a fixed timer and never regenerate.",
  },
  {
    question: "Do missions outside the campaign list count?",
    answer:
      "You can drop on any liberated planet, but those planets sit outside the active campaigns and regenerate faster than a handful of squads can damage them, so they stay at full health. The game master sees that traffic and can steer the war around it.",
  },
  {
    question: "Why does the table show no estimated liberation time?",
    answer:
      "A countdown needs to know how fast players are pushing, and one snapshot of the API carries only the planet's health and the enemy's regeneration. The Regen column shows what Super Earth has to out-damage per hour; anything beyond that would be a guess dressed up as a number.",
  },
  {
    question: "What are supply lines on the galactic map?",
    answer:
      "Supply lines connect planets and decide where Super Earth can attack next. Liberate a planet and its neighbours open up; lose one and the planets behind it can be cut off. The game master also opens and closes supply lines by hand to shape the war.",
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
    storage: "135 GB available space",
    notes: "64-bit processor required",
  } satisfies BaseSystemRequirements,
  recommended: {
    os: "Windows 10",
    processor: "Intel Core i7-9700K or AMD Ryzen 7 3700X",
    memory: "16 GB RAM",
    graphics: "NVIDIA GeForce RTX 2060 or AMD Radeon RX 6600XT",
    storage: "135 GB available space",
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
          Terminids (bugs), the Automatons (robots) and the Illuminate. You pick
          which front to drop into. A game master at Arrowhead rotates the
          active campaigns and reshapes the war while you play.
        </p>

        <p>
          All players share one war. Every mission you finish chips away at a
          planet&apos;s health pool and pushes it toward liberation. This site
          reads the same numbers the game does: active campaigns, liberation
          percentages and how fast the enemy is clawing territory back.
        </p>

        <p>
          The campaign table lists every contested planet, and clicking a row
          opens its biome, hazards and combat record. The map pins the same
          planets and colours them by liberation.
        </p>
      </div>

      <h3 className="mt-8 mb-4 text-2xl font-medium tracking-tighter">
        How does liberation math work?
      </h3>

      <ul className="list-outside list-disc space-y-2 pl-4">
        <li>
          Every planet carries an internal HP pool. Liberation campaigns run on
          a fixed 1,000,000. Defense campaigns range from roughly 600k to over 2
          million.
        </li>
        <li>
          That pool refills on its own, usually 1.5% to 4.5% per hour, and the
          game master can crank it past 20% to stall a push. Defense campaigns
          run on a timer instead and never refill.
        </li>
        <li>
          Each operation you complete subtracts from the pool, so a planet falls
          in proportion to how many squads are on it.
        </li>
        <li>
          The enemy pushes back too. Counter-attacks land as sudden dips of 1–2%
          and often arrive in a run of three or four.
        </li>
      </ul>
    </div>
  );
}

function FAQItems() {
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
          Answers compiled from the{" "}
          <a
            className="underline hover:text-primary"
            href="https://helldivers.wiki.gg/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Helldivers Wiki
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

export default function FAQSection() {
  return (
    <section id="faq">
      <Container title="Frequently Asked Questions" className="mb-4 lg:mb-8">
        <div className="grid gap-8 md:grid-cols-2">
          <LiberationMechanics />
          <FAQItems />
        </div>
      </Container>

      <Container title="PC System Requirements">
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Per Steam store listing. Also on PlayStation 5 and Xbox Series X|S.
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
    </section>
  );
}
