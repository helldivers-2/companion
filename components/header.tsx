"use client";

import Link from "next/link";
import Image from "next/image";
import {
  type LucideIcon,
  Info,
  Rocket,
  Newspaper,
  ChartColumnBig,
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import logo from "@/app/icon0.svg";

interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roundedClass?: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Status",
    href: "/",
    icon: Rocket,
    roundedClass: "rounded-xl rounded-l-full",
  },
  {
    title: "News",
    href: "/news",
    icon: Newspaper,
    roundedClass: "rounded-xl",
  },
  {
    title: "Statistics",
    href: "/statistics",
    icon: ChartColumnBig,
    roundedClass: "rounded-xl",
  },
  {
    title: "FAQ",
    href: "/faq",
    icon: Info,
    roundedClass: "rounded-xl rounded-r-full",
  },
] as const;

const LOGO_CONFIG = {
  src: logo,
  width: 128,
  height: 128,
  alt: "Helldivers Companion Logo",
  ariaLabel: "Helldivers Companion Home",
} as const;

const STYLES = {
  header:
    "fixed bottom-0 left-0 z-[1500] flex w-full justify-center p-6 sm:top-0 sm:bottom-auto",
  navigationMenu: "glass-ui p-1",
  navigationLink: "bg-transparent hover:bg-transparent focus:bg-transparent",
  logoContainer: "hidden sm:inline-flex",
  logo: "size-6",
  navItemContainer: "block items-center sm:flex",
  navIcon: "mx-auto size-6 pt-2 text-icon sm:mr-2 sm:size-4 sm:pt-0",
  navTitle: "text-center text-xs",
} as const;

function LogoItem() {
  return (
    <NavigationMenuItem className={STYLES.logoContainer}>
      <Link
        className={cn(navigationMenuTriggerStyle(), STYLES.navigationLink)}
        href="/"
        aria-label={LOGO_CONFIG.ariaLabel}
      >
        <Image
          priority
          src={LOGO_CONFIG.src}
          width={LOGO_CONFIG.width}
          height={LOGO_CONFIG.height}
          className={STYLES.logo}
          alt={LOGO_CONFIG.alt}
        />
      </Link>
    </NavigationMenuItem>
  );
}

function NavigationItem({ item }: { item: NavigationItem }) {
  const { title, href, icon: Icon, roundedClass } = item;

  return (
    <NavigationMenuItem key={href}>
      <NavigationMenuLink
        className={cn(
          navigationMenuTriggerStyle(),
          STYLES.navigationLink,
          roundedClass,
        )}
        href={href}
      >
        <div className={STYLES.navItemContainer}>
          <Icon className={STYLES.navIcon} />
          <span className={STYLES.navTitle}>{title}</span>
        </div>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

export function Header() {
  return (
    <header className={STYLES.header}>
      <div className="inline-flex gap-2">
        <NavigationMenu
          viewport={false}
          className={cn(STYLES.navigationMenu, "hidden sm:inline-block")}
        >
          <NavigationMenuList>
            <LogoItem />
          </NavigationMenuList>
        </NavigationMenu>
        <NavigationMenu viewport={false} className={STYLES.navigationMenu}>
          <NavigationMenuList>
            {NAVIGATION_ITEMS.map((item) => (
              <NavigationItem key={item.href} item={item} />
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
