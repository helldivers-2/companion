"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {
  Info,
  Rocket,
  Newspaper,
  ChartColumnBig,
  type LucideIcon,
} from "lucide-react";

import logo from "@/app/icon0.svg";

interface NavigationItem {
  title: string;
  href: string;
  description?: string;
  icon: LucideIcon;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Status",
    href: "/",
    icon: Rocket,
  },
  {
    title: "News",
    href: "/news",
    icon: Newspaper,
  },
  {
    title: "Statistics",
    href: "/statistics",
    icon: ChartColumnBig,
  },
  {
    title: "FAQ",
    href: "/faq",
    icon: Info,
  },
] as const;

const Logo = React.memo(() => (
  <Link
    className="flex items-center"
    href="/"
    aria-label="Helldivers Companion Home"
  >
    <Image
      priority
      src={logo}
      width={128}
      height={128}
      className="mr-2 size-6"
      alt="Helldivers Companion Logo"
    />
    <span className="flex text-xl font-bold">Helldivers Companion</span>
  </Link>
));
Logo.displayName = "Logo";

const NavigationLink = React.memo<{
  item: NavigationItem;
  variant?: "desktop" | "mobile";
}>(({ item, variant = "desktop" }) => {
  const { title, href, icon: Icon } = item;
  const isMobile = variant === "mobile";

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        className={cn(
          navigationMenuTriggerStyle(),
          isMobile
            ? "bg-transparent hover:bg-transparent data-[active=true]:hover:bg-transparent data-[active=true]:focus:bg-transparent"
            : "",
        )}
        href={href}
      >
        <div className={isMobile ? "block md:flex" : "flex items-center"}>
          <Icon
            className={cn(
              isMobile ? "mx-auto size-6 md:mr-1 md:size-4" : "mr-2 size-4",
            )}
          />
          <span className="text-center text-xs">{title}</span>
        </div>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
});
NavigationLink.displayName = "NavigationLink";

const DesktopNavigation = React.memo(() => (
  <NavigationMenu className="website mt-4 md:mt-0">
    <NavigationMenuList className="grid grid-cols-2 gap-2 md:flex">
      {NAVIGATION_ITEMS.map((item) => (
        <NavigationLink key={item.href} item={item} variant="desktop" />
      ))}
    </NavigationMenuList>
  </NavigationMenu>
));
DesktopNavigation.displayName = "DesktopNavigation";

const MobileNavigation = React.memo(() => (
  <div className="pwa fixed right-0 bottom-0 z-50 w-full">
    <div className="rounded-t-xl bg-background">
      <div className="h-20 w-full items-center border-t border-primary bg-[#facc15] p-4 transition">
        <NavigationMenu variant="pwa">
          <NavigationMenuList
            variant="pwa"
            className="flex w-full justify-between"
          >
            {NAVIGATION_ITEMS.map((item) => (
              <NavigationLink key={item.href} item={item} variant="mobile" />
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  </div>
));
MobileNavigation.displayName = "MobileNavigation";

const HeaderContent = React.memo(() => (
  <div className="m-2 block items-center justify-between md:flex">
    <div className="flex w-full items-center justify-between md:block">
      <Logo />
    </div>
    <DesktopNavigation />
    <MobileNavigation />
  </div>
));
HeaderContent.displayName = "HeaderContent";

const Header = React.memo(() => (
  <header className="sticky top-0 left-0 z-[1500]">
    <div className="mx-4 pt-4">
      <div className="w-full rounded-lg bg-background">
        <nav
          className="bg-opacity-20 h-fit rounded-lg border border-primary bg-[#facc15]"
          role="navigation"
          aria-label="Main navigation"
        >
          <HeaderContent />
        </nav>
      </div>
    </div>
  </header>
));
Header.displayName = "Header";

export default Header;
