import { siteConfig } from "@/config/site";

import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import {
  SiDiscord,
  SiReddit,
  SiSteam,
  SiInstagram,
  SiYoutube,
  SiGithub,
} from "@icons-pack/react-simple-icons";
import { House } from "lucide-react";

interface SocialLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface CreditLink {
  href: string;
  label: string;
  description: string;
}

const CREDITS: CreditLink[] = [
  {
    href: "https://github.com/shadcn/ui",
    label: "shadcn/ui",
    description: "UI Framework",
  },
  {
    href: "https://giscus.app/",
    label: "giscus",
    description: "Comment Feature",
  },
  {
    href: "https://github.com/helldivers-2/api",
    label: "Helldivers API",
    description: "Game API",
  },
];

const FAN_COMMUNITIES: SocialLink[] = [
  {
    href: "https://discord.gg/helldivers",
    icon: SiDiscord,
    label: "Discord",
  },
  {
    href: "https://www.reddit.com/r/Helldivers/",
    icon: SiReddit,
    label: "Reddit",
  },
  {
    href: "https://steamcommunity.com/app/553850",
    icon: SiSteam,
    label: "Steam",
  },
];

const ARROWHEAD_LINKS: SocialLink[] = [
  {
    href: "https://www.arrowheadgamestudios.com/",
    icon: House,
    label: "Arrowhead Studios Website",
  },
  {
    href: "https://instagram.com/arrowheadgamestudios/",
    icon: SiInstagram,
    label: "Instagram",
  },
  {
    href: "https://www.youtube.com/user/ArrowheadGameStudios",
    icon: SiYoutube,
    label: "YouTube",
  },
  {
    href: "https://github.com/helldivers-2",
    icon: SiGithub,
    label: "Helldivers 2 Github Organisation",
  },
];

const SocialNav = ({
  links,
  title,
}: {
  links: SocialLink[];
  title: string;
}) => (
  <div>
    <h5 className="mb-4 text-sm font-semibold tracking-wide uppercase">
      {title}
    </h5>
    <nav className="flex gap-2 sm:w-2/3 md:w-full lg:w-2/3">
      {links.map(({ href, icon: Icon, label }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block py-2 text-muted-foreground transition hover:text-foreground"
          aria-label={label}
        >
          <Icon className="size-6" />
          <span className="sr-only">{label}</span>
        </a>
      ))}
    </nav>
  </div>
);

const CreditsList = ({ credits }: { credits: CreditLink[] }) => (
  <ul className="space-y-1">
    {credits.map(({ href, label, description }) => (
      <li key={href}>
        <a className="underline transition-all hover:no-underline" href={href}>
          {label}
        </a>
        {" - "}
        <span className="text-muted-foreground">{description}</span>
      </li>
    ))}
  </ul>
);

const ProjectInfo = () => (
  <div>
    <h5 className="text-sm font-semibold tracking-wide uppercase">
      Helldivers Companion
    </h5>
    <p className="mt-4 text-sm text-muted-foreground">
      A project by{" "}
      <Link
        className="underline transition-all hover:no-underline"
        href={siteConfig.links.github}
      >
        michi.onl.
      </Link>
    </p>
  </div>
);

const AboutSection = () => (
  <div>
    <p className="leading-relaxed text-muted-foreground">
      Welcome to the Helldivers Companion Fan Project, a source for real-time
      API data for the game Helldivers 2!
    </p>
    <div className="mt-6">
      <h6 className="mb-3 text-sm font-medium">Built with:</h6>
      <CreditsList credits={CREDITS} />
    </div>
  </div>
);

const DisclaimerSection = () => (
  <p className="my-8 text-center text-sm text-muted-foreground">
    This site is fan-made and not affiliated with Arrowhead Game Studios in any
    way.
  </p>
);

export default function Footer() {
  return (
    <div className="website">
      <Separator />
      <footer className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ProjectInfo />

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            <AboutSection />

            <div className="space-y-8">
              <SocialNav links={FAN_COMMUNITIES} title="Fan Communities" />
              <SocialNav links={ARROWHEAD_LINKS} title="Arrowhead Accounts" />
            </div>
          </div>
        </div>
      </footer>
      <Separator />
      <DisclaimerSection />
    </div>
  );
}
