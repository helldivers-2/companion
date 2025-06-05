"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {
  Info,
  ShoppingBasket,
  Rocket,
  Box,
  MoreHorizontal,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

import { UserMenu } from "@/components/user-menu";
import logo from "@/app/favicon.ico";

interface NavigationItem {
  title: string;
  href: string;
  description?: string;
  icon: LucideIcon;
  showInPWA?: boolean;
}

interface DropdownItem {
  title: string;
  href: string;
  description: string;
}

const DROPDOWN_ITEMS: DropdownItem[] = [
  {
    title: "All Items",
    href: "/items",
    description: "All 167 items in the game organized into categories.",
  },
  {
    title: "All Stratagems",
    href: "/stratagems",
    description: "All Stratagems in the game.",
  },
] as const;

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Status",
    href: "/",
    icon: Rocket,
    showInPWA: true,
  },
  {
    title: "Item Shop",
    href: "/shop",
    icon: ShoppingBasket,
    showInPWA: true,
  },
  {
    title: "News",
    href: "/news",
    icon: Newspaper,
    showInPWA: true,
  },
  {
    title: "FAQ",
    href: "/faq",
    icon: Info,
    showInPWA: false,
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
      className="mr-2 size-6 rounded bg-foreground p-1 dark:bg-transparent dark:p-0"
      alt="Helldivers Companion Logo"
    />
    <span className="flex text-xl font-bold">Helldivers Companion</span>
  </Link>
));
Logo.displayName = "Logo";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title?: string;
  }
>(({ className, title, children, ...props }, ref) => (
  <li>
    <NavigationMenuLink asChild>
      <a
        ref={ref}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        {title && (
          <div className="text-sm font-medium leading-none">{title}</div>
        )}
        {children && (
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        )}
      </a>
    </NavigationMenuLink>
  </li>
));
ListItem.displayName = "ListItem";

const NavigationLink = React.memo<{
  item: NavigationItem;
  variant?: "desktop" | "mobile";
}>(({ item, variant = "desktop" }) => {
  const { title, href, icon: Icon } = item;
  const isMobile = variant === "mobile";

  return (
    <NavigationMenuItem>
      <Link href={href}>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
          <div className={isMobile ? "block md:flex" : "flex items-center"}>
            <Icon
              className={cn(
                isMobile
                  ? "mx-auto size-6 md:mr-1 md:size-4"
                  : "mr-1 size-6 md:size-4"
              )}
            />
            <span className="text-center text-xs">{title}</span>
          </div>
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
});
NavigationLink.displayName = "NavigationLink";

const ItemTablesDropdown = React.memo(() => (
  <NavigationMenuItem>
    <NavigationMenuTrigger>
      <Box className="mr-1 size-6 md:size-4" />
      <span className="text-center text-xs">Item Tables</span>
    </NavigationMenuTrigger>
    <NavigationMenuContent>
      <ul className="grid w-[320px] gap-3 p-4 md:w-[440px] md:grid-cols-2">
        {DROPDOWN_ITEMS.map((item) => (
          <ListItem key={item.href} title={item.title} href={item.href}>
            {item.description}
          </ListItem>
        ))}
      </ul>
    </NavigationMenuContent>
  </NavigationMenuItem>
));
ItemTablesDropdown.displayName = "ItemTablesDropdown";

const DesktopNavigation = React.memo(() => (
  <NavigationMenu className="website mt-4 w-full md:mt-0">
    <NavigationMenuList className="grid grid-cols-2 gap-2 md:flex md:gap-0">
      {NAVIGATION_ITEMS.map((item) => (
        <NavigationLink key={item.href} item={item} variant="desktop" />
      ))}
      <ItemTablesDropdown />
    </NavigationMenuList>
  </NavigationMenu>
));
DesktopNavigation.displayName = "DesktopNavigation";

const MobileNavigation = React.memo(() => (
  <div className="pwa fixed bottom-0 right-0 z-50 w-full md:relative md:bottom-auto md:right-auto md:hidden md:w-auto">
    <div className="rounded-t-xl bg-background md:bg-transparent">
      <div className="h-20 w-full items-center rounded-t-xl border-t border-primary bg-[#facc15] bg-opacity-20 p-4 transition md:my-auto md:h-auto md:border-none md:bg-transparent md:p-0">
        <NavigationMenu variant="pwa">
          <NavigationMenuList variant="pwa">
            {NAVIGATION_ITEMS.filter((item) => item.showInPWA).map((item) => (
              <NavigationLink key={item.href} item={item} variant="mobile" />
            ))}
            <NavigationMenuItem className="md:hidden">
              <UserMenu>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <div className="block md:flex">
                    <MoreHorizontal className="mx-auto size-6 md:mr-1 md:size-4" />
                  </div>
                </NavigationMenuLink>
              </UserMenu>
            </NavigationMenuItem>
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
  <header className="sticky left-0 top-0 z-[1500]">
    <div className="mx-4 pt-4">
      <div className="w-full rounded-lg bg-background">
        <nav
          className="h-fit rounded-lg border border-primary bg-[#facc15] bg-opacity-20"
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
