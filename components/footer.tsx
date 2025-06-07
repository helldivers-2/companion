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
  SiFandom,
} from "@icons-pack/react-simple-icons";
import {
  Component,
  MessageSquareText,
  ChevronsLeftRightEllipsis,
  Building2,
} from "lucide-react";

interface CreditLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface SocialLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const CREDITS: CreditLink[] = [
  {
    href: "https://github.com/shadcn/ui",
    icon: Component,
    label: "shadcn/ui",
  },
  {
    href: "https://giscus.app/",
    icon: MessageSquareText,
    label: "giscus",
  },
  {
    href: "https://github.com/helldivers-2/api",
    icon: ChevronsLeftRightEllipsis,
    label: "Helldivers 2 API",
  },
];
//       "Game API - ONLY THIS API! - SOCIAL FANDOM LINK? DO NOT COMMIT",

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
  {
    href: "https://helldivers.fandom.com/",
    icon: SiFandom,
    label: "Fandom",
  },
  {
    href: "https://github.com/helldivers-2",
    icon: SiGithub,
    label: "Helldivers 2 Github Organisation",
  },
];

const ARROWHEAD_LINKS: SocialLink[] = [
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
    href: "https://www.arrowheadgamestudios.com/",
    icon: Building2,
    label: "Arrowhead Studios Website",
  },
];

const CreditsList = ({ credits }: { credits: CreditLink[] }) => (
  <div className="space-y-1">
    {credits.map(({ href, icon: Icon, label }) => (
      <a
        className="flex gap-2 items-center transition-all hover:underline"
        href={href}
        key={href}
      >
        <Icon className="mt-0.5 size-4 text-muted-foreground" />
        {label}
      </a>
    ))}
  </div>
);

const SocialNav = ({
  links,
  title,
}: {
  links: SocialLink[];
  title: string;
}) => (
  <div>
    <h5 className="text-sm font-semibold tracking-wide uppercase">
      {title}
    </h5>
    <nav className="flex gap-4">
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
  <div className="space-y-4">
    <p className="leading-relaxed text-muted-foreground">
      Welcome to the Helldivers Companion Fan Project, a source for real-time
      API data for the game Helldivers 2!
    </p>
    <CreditsList credits={CREDITS} />
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
        <div className="container mx-auto space-y-8 px-4 lg:px-8">
          <ProjectInfo />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            <AboutSection />

            <div className="space-y-4">
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
