"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {
  LuInfo,
  LuNewspaper,
  LuShoppingBasket,
  LuRocket,
  LuBox,
} from "react-icons/lu";

import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  return (
    <header className="sticky left-0 top-0 z-[1500]">
      <div className="mx-4 pt-4">
        <div className="w-full rounded-lg bg-background">
          <nav className="h-fit rounded-lg border border-primary bg-[#facc15] bg-opacity-20">
            <div className="m-2 block items-center justify-between md:flex">
              <div className="flex items-center justify-between">
                <Link href="/">
                  <span className="flex text-xl font-bold">
                    HELLDIVERS.info
                  </span>
                </Link>
                <div className="block md:hidden">
                  <ThemeToggle />
                </div>
              </div>
              <NavigationMenu className="mt-4 w-full md:mt-0">
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
                    <Link href="/items" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        <LuBox className="mr-1 size-6 md:size-4" />
                        <span className=" text-center text-xs ">all Items</span>
                      </NavigationMenuLink>
                    </Link>
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
                  <NavigationMenuItem></NavigationMenuItem>
                  <NavigationMenuItem className="hidden md:block">
                    <ThemeToggle />
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
