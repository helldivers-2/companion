"use client";

import Giscus, { BooleanString } from "@giscus/react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { IoChatbubblesOutline } from "react-icons/io5";

interface InfoDialogProps {
  keyword: string;
  reactions: BooleanString;
}

export default function Comments({ keyword, reactions }: InfoDialogProps) {
  return (
    <div className="mt-10">
      <Sheet>
        <SheetTrigger className="hidden w-full sm:block">
          <Button variant="outline" className="w-full">
            <IoChatbubblesOutline className="mr-2 size-4" /> Comment on this
          </Button>
        </SheetTrigger>
        <SheetContent className="z-[2000]">
          <Giscus
            id="comments"
            repo="Mixhi1845/HelldiversCompanion"
            repoId="R_kgDOLhSEpQ="
            category="Comments"
            categoryId="DIC_kwDOLhSEpc4CeV8r"
            mapping="specific"
            term={keyword}
            reactionsEnabled={reactions}
            emitMetadata="0"
            inputPosition="top"
            theme="preferred_color_scheme"
            lang="en"
            loading="lazy"
          />
        </SheetContent>
      </Sheet>
      <Drawer>
        <DrawerTrigger className="block w-full sm:hidden">
          <Button variant="outline" className="w-full">
            <IoChatbubblesOutline className="mr-2 size-4" /> Comment on this
          </Button>
        </DrawerTrigger>
        <DrawerContent className="z-[2000]">
          <div className="p-4">
            <Giscus
              id="comments"
              repo="Mixhi1845/HelldiversCompanion"
              repoId="R_kgDOLhSEpQ="
              category="Comments"
              categoryId="DIC_kwDOLhSEpc4CeV8r"
              mapping="specific"
              term={keyword}
              reactionsEnabled={reactions}
              emitMetadata="0"
              inputPosition="top"
              theme="preferred_color_scheme"
              lang="en"
              loading="lazy"
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
