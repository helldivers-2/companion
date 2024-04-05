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
  NavigationMenuPWA,
  NavigationMenuItemPWA,
  NavigationMenuLinkPWA,
  NavigationMenuListPWA,
  navigationMenuTriggerStylePWA,
} from "@/components/ui/navigation-menu-pwa";

import {
  LuInfo,
  LuShoppingBasket,
  LuRocket,
  LuBox,
  LuMoreHorizontal,
  LuNewspaper,
} from "react-icons/lu";

import { UserMenu } from "./user-menu";

import logo from "@/app/favicon.ico";
import { ThemeToggle } from "./theme-toggle";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "all Items",
    href: "/items",
    description: "All 167 items in the game organized into categories.",
  },
  {
    title: "all Stratagems",
    href: "/stratagems",
    description: "All Stratagems in the game.",
  },
];

export default function Navbar() {
  return (
    <header className="sticky left-0 top-0 z-[1500]">
      <div className="mx-4 pt-4">
        <div className="w-full rounded-lg bg-background">
          <nav className="h-fit rounded-lg border border-primary bg-[#facc15] bg-opacity-20">
            <div className="m-2 block items-center justify-between md:flex">
              <div className="flex w-full items-center justify-between md:block">
                <Link className="flex items-center" href="/">
                  <Image
                    priority
                    src={logo}
                    width={128}
                    height={128}
                    className="mr-2 size-6 rounded bg-foreground p-1 dark:bg-transparent dark:p-0"
                    alt="Logo"
                  />
                  <span className="flex text-xl font-bold">
                    Helldivers Companion
                  </span>
                </Link>
                <div className="website block md:hidden">
                  <ThemeToggle />
                </div>
              </div>
              <NavigationMenu className="website mt-4 w-full md:mt-0">
                <NavigationMenuList className="grid grid-cols-2 gap-2 md:flex md:gap-0">
                  <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        <LuRocket className="mr-1 size-6 md:size-4" />
                        <span className=" text-center text-xs ">Status</span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  {/*<NavigationMenuItem>
                    <Link href="/shop" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        <LuShoppingBasket className="mr-1 size-6 md:size-4" />
                        <span className="text-center text-xs">Item Shop</span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>*/}
                  <NavigationMenuItem>
                    <Link href="/news" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        <LuNewspaper className="mr-1 size-6 md:size-4" />
                        <span className=" text-center text-xs ">News</span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      <LuBox className="mr-1 size-6 md:size-4" />
                      <span className="text-center text-xs ">Item Tables</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[320px] gap-3 p-4 md:w-[440px] md:grid-cols-2">
                        {components.map((component) => (
                          <ListItem
                            key={component.title}
                            title={component.title}
                            href={component.href}
                          >
                            {component.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/faq" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        <LuInfo className="mr-1 size-6 md:size-4" />
                        <span className=" text-center text-xs ">FAQ</span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="hidden md:block">
                    <ThemeToggle />
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              <div className="pwa fixed bottom-0 right-0 z-50 w-full md:relative md:bottom-auto md:right-auto md:hidden md:w-auto ">
                <div className="rounded-t-xl bg-background md:bg-transparent">
                  <div className="h-20 w-full items-center rounded-t-xl border-t border-primary bg-[#facc15] bg-opacity-20 p-4  transition md:my-auto md:h-auto  md:border-none md:bg-transparent md:p-0">
                    <NavigationMenuPWA>
                      <NavigationMenuListPWA>
                        <NavigationMenuItemPWA>
                          <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLinkPWA
                              className={navigationMenuTriggerStylePWA()}
                            >
                              <div className="block md:flex">
                                <LuRocket className="mx-auto size-6 md:mr-1 md:size-4" />
                                <span className="text-center text-xs">
                                  Status
                                </span>
                              </div>
                            </NavigationMenuLinkPWA>
                          </Link>
                        </NavigationMenuItemPWA>
                        <NavigationMenuItemPWA>
                          <Link href="/news" legacyBehavior passHref>
                            <NavigationMenuLinkPWA
                              className={navigationMenuTriggerStylePWA()}
                            >
                              <div className="block md:flex">
                                <LuNewspaper className="mx-auto size-6 md:mr-1 md:size-4" />
                                <span className="text-center text-xs">
                                  News
                                </span>
                              </div>
                            </NavigationMenuLinkPWA>
                          </Link>
                        </NavigationMenuItemPWA>
                        <NavigationMenuItemPWA>
                          <Link href="#" legacyBehavior passHref>
                            <NavigationMenuLinkPWA
                              className={navigationMenuTriggerStylePWA()}
                            >
                              <div className="block md:flex">
                                <LuShoppingBasket className="mx-auto size-6 text-muted-foreground md:mr-1 md:size-4" />
                                <span className="text-center text-xs text-muted-foreground">
                                  Item Shop
                                </span>
                              </div>
                            </NavigationMenuLinkPWA>
                          </Link>
                        </NavigationMenuItemPWA>
                        <NavigationMenuItemPWA className="md:hidden">
                          <UserMenu>
                            <NavigationMenuLinkPWA
                              className={navigationMenuTriggerStylePWA()}
                            >
                              <div className="block md:flex">
                                <LuMoreHorizontal className="mx-auto size-6 md:mr-1 md:size-4" />
                              </div>
                            </NavigationMenuLinkPWA>
                          </UserMenu>
                        </NavigationMenuItemPWA>
                        <NavigationMenuItemPWA className="hidden md:block">
                          <ThemeToggle />
                        </NavigationMenuItemPWA>
                      </NavigationMenuListPWA>
                    </NavigationMenuPWA>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
