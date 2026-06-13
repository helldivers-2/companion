# Merge Pages into Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Combine `/news`, `/statistics`, and `/faq` into a single home page (`/`) with anchor navigation, redirect old routes, and remove comments.

**Architecture:** Extract page content into reusable section components under `components/widgets/merged/`, stack them vertically on the home page with section IDs, convert nav links to anchor tags, replace old routes with `permanentRedirect`, add smooth scrolling via CSS.

**Tech Stack:** Next.js 16 App Router, React Server Components, Tailwind CSS v4, Radix UI NavigationMenu

---

## File Structure

| File                                               | Action | Responsibility                                                                 |
| -------------------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| `app/globals.css`                                  | Modify | Add `scroll-behavior: smooth` to `html`                                        |
| `components/widgets/merged/news-section.tsx`       | Create | Renders News page content (Steam Newsfeed + Wikipedia) with `#news` id         |
| `components/widgets/merged/statistics-section.tsx` | Create | Renders Statistics widget with `#statistics` id                                |
| `components/widgets/merged/faq-section.tsx`        | Create | Renders FAQ page content (mechanics, FAQ, system requirements) with `#faq` id  |
| `app/page.tsx`                                     | Modify | Import and render all sections with vertical spacing; remove `discussion` prop |
| `components/header.tsx`                            | Modify | Update `NAVIGATION_ITEMS` hrefs to anchor links                                |
| `app/news/page.tsx`                                | Modify | Replace with `permanentRedirect('/#news')`                                     |
| `app/statistics/page.tsx`                          | Modify | Replace with `permanentRedirect('/#statistics')`                               |
| `app/faq/page.tsx`                                 | Modify | Replace with `permanentRedirect('/#faq')`                                      |

---

### Task 1: Add Smooth Scrolling

**Files:**

- Modify: `app/globals.css`

Add `scroll-behavior: smooth` to the `html` element so anchor navigation feels professional.

- [ ] **Step 1: Add smooth scroll CSS**

Insert a new `html` rule inside the existing `@layer base` block:

```css
@layer base {
  html {
    scroll-behavior: smooth;
  }
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: add smooth scroll for anchor navigation"
```

---

### Task 2: Create News Section Component

**Files:**

- Create: `components/widgets/merged/news-section.tsx`

Extracts the News page layout into a reusable Server Component with `id="news"` on the outer wrapper.

- [ ] **Step 1: Write `news-section.tsx`**

```tsx
import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";
import PatchNotes from "@/components/widgets/news/newsfeed";
import WikipediaText from "@/components/widgets/news/wiki";

const dashboardCards = [
  {
    title: "Steam Newsfeed",
    component: PatchNotes,
    key: "steam",
  },
  {
    title: "About Helldivers 2",
    component: WikipediaText,
    key: "wiki",
  },
];

export default function NewsSection() {
  return (
    <section id="news">
      <Container title="News" lgSplit>
        {dashboardCards.map(({ title, component: Component, key }) => (
          <DashboardCard key={key} title={title}>
            <Component />
          </DashboardCard>
        ))}
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/widgets/merged/news-section.tsx
git commit -m "feat: add news section component for merged home page"
```

---

### Task 3: Create Statistics Section Component

**Files:**

- Create: `components/widgets/merged/statistics-section.tsx`

Extracts the Statistics page layout with `id="statistics"` on the outer wrapper.

- [ ] **Step 1: Write `statistics-section.tsx`**

```tsx
import Container from "@/components/container";
import Statistics from "@/components/widgets/statistics/statistics";

export default function StatisticsSection() {
  return (
    <section id="statistics">
      <Container title="Statistics">
        <Statistics />
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/widgets/merged/statistics-section.tsx
git commit -m "feat: add statistics section component for merged home page"
```

---

### Task 4: Create FAQ Section Component

**Files:**

- Create: `components/widgets/merged/faq-section.tsx`

Moves all FAQ page content (mechanics, FAQ, system requirements) into one component with `id="faq"` on the outer wrapper.

- [ ] **Step 1: Write `faq-section.tsx`**

```tsx
import Container from "@/components/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function FAQSectionComponent() {
  return (
    <section id="faq">
      <Container title="Frequently Asked Questions" className="mb-4 lg:mb-8">
        <div className="grid gap-8 md:grid-cols-2">
          <LiberationMechanics />
          <FAQSection />
        </div>
      </Container>

      <Container title="PC System Requirements">
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
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/widgets/merged/faq-section.tsx
git commit -m "feat: add FAQ section component for merged home page"
```

---

### Task 5: Merge Sections into Home Page

**Files:**

- Modify: `app/page.tsx`

Replaces the current single-section home page with a vertically stacked layout containing Status, News, Statistics, and FAQ. Removes the `discussion` prop to eliminate Giscus comments.

- [ ] **Step 1: Rewrite `app/page.tsx`**

```tsx
import type { Metadata } from "next";
import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";

import MajorOrder from "@/components/widgets/root/major-order";
import CampaignTable from "@/components/widgets/root/campaign-table";
import Dispatches from "@/components/widgets/root/dispatches";
import CampaignMap from "@/components/widgets/root/campaign-map-server";
import SpaceStation from "@/components/widgets/root/space-station";
import WarSummary from "@/components/widgets/root/war-summary";

import NewsSection from "@/components/widgets/merged/news-section";
import StatisticsSection from "@/components/widgets/merged/statistics-section";
import FAQSection from "@/components/widgets/merged/faq-section";

export const metadata: Metadata = {
  title: "War Status",
  description:
    "Relevant Helldivers Data at a Glance. Orders, Campaigns and Map.",
};

export default function StatusPage() {
  return (
    <div className="space-y-8">
      <section id="status">
        <Container>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <WarSummary />
            </div>

            <div className="lg:col-span-2">
              <DashboardCard title="Major Order">
                <MajorOrder />
              </DashboardCard>
            </div>

            <div className="lg:col-span-1">
              <DashboardCard title="Space Station">
                <SpaceStation />
              </DashboardCard>
            </div>

            <div className="lg:col-span-3">
              <DashboardCard title="Campaigns">
                <CampaignTable />
              </DashboardCard>
            </div>

            <div className="self-start lg:col-span-2">
              <DashboardCard title="Map">
                <CampaignMap />
              </DashboardCard>
            </div>

            <div className="self-start lg:col-span-1">
              <DashboardCard title="Dispatches">
                <ScrollArea className="lg:h-[500px]">
                  <Dispatches />
                </ScrollArea>
              </DashboardCard>
            </div>
          </div>
        </Container>
      </section>

      <NewsSection />
      <StatisticsSection />
      <FAQSection />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: merge news, statistics, and FAQ sections into home page"
```

---

### Task 6: Update Header Navigation to Anchor Links

**Files:**

- Modify: `components/header.tsx`

Updates `NAVIGATION_ITEMS` hrefs to use anchor links. The `NavigationMenuLink` from Radix UI already renders a plain `<a>` tag, so no component-level changes are needed beyond updating the `href` values.

- [ ] **Step 1: Update hrefs in `components/header.tsx`**

Replace the `NAVIGATION_ITEMS` constant:

```tsx
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Status",
    href: "/",
    icon: Rocket,
    roundedClass: "rounded-xl rounded-l-full",
  },
  {
    title: "News",
    href: "#news",
    icon: Newspaper,
    roundedClass: "rounded-xl",
  },
  {
    title: "Statistics",
    href: "#statistics",
    icon: ChartColumnBig,
    roundedClass: "rounded-xl",
  },
  {
    title: "FAQ",
    href: "#faq",
    icon: Info,
    roundedClass: "rounded-xl rounded-r-full",
  },
] as const;
```

- [ ] **Step 2: Commit**

```bash
git add components/header.tsx
git commit -m "feat: convert nav links to anchor links for merged sections"
```

---

### Task 7: Replace Old Pages with Redirects

**Files:**

- Modify: `app/news/page.tsx`
- Modify: `app/statistics/page.tsx`
- Modify: `app/faq/page.tsx`

Each old page is replaced with a minimal server component that calls `permanentRedirect` to the corresponding anchor on the home page.

- [ ] **Step 1: Replace `app/news/page.tsx`**

```tsx
import { permanentRedirect } from "next/navigation";

export default function NewsPage() {
  permanentRedirect("/#news");
}
```

- [ ] **Step 2: Replace `app/statistics/page.tsx`**

```tsx
import { permanentRedirect } from "next/navigation";

export default function StatisticsPage() {
  permanentRedirect("/#statistics");
}
```

- [ ] **Step 3: Replace `app/faq/page.tsx`**

```tsx
import { permanentRedirect } from "next/navigation";

export default function FAQPage() {
  permanentRedirect("/#faq");
}
```

- [ ] **Step 4: Commit**

```bash
git add app/news/page.tsx app/statistics/page.tsx app/faq/page.tsx
git commit -m "feat: redirect old routes to home page anchors"
```

---

### Task 8: Build Verification

- [ ] **Step 1: Run production build**

```bash
pnpm build
```

Expected: Build completes with zero errors and zero warnings.

- [ ] **Step 2: Run linter**

```bash
pnpm lint
```

Expected: No ESLint errors.

- [ ] **Step 3: Commit if clean**

If build and lint pass, commit any auto-generated files (if applicable):

```bash
git status
# If clean, nothing to commit. If not, review changes.
```

---

## Self-Review Checklist

- [ ] **Spec coverage:** Every requirement from `2026-05-31-merge-pages-design.md` is covered by at least one task.
- [ ] **Placeholder scan:** No "TBD", "TODO", "implement later", or vague instructions remain.
- [ ] **Type consistency:** All component names, file paths, and prop names match between tasks.

**Spec coverage mapping:**

- Anchor nav links → Task 6
- Smooth scrolling → Task 1
- Vertical spacing → Task 5 (`space-y-8` wrapper)
- Section IDs → Tasks 2, 3, 4 (outer `<section id="...">`)
- Redirects → Task 7
- Comments removed → Task 5 (removes `discussion` prop from `Container`)
- FAQ content preserved → Task 4 (all mechanics, FAQ, requirements copied verbatim)
- Plain `<a>` tags → Task 6 (Radix `NavigationMenuLink` renders `<a>` natively)
