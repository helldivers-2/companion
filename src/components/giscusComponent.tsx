"use client";

import Giscus, { BooleanString } from "@giscus/react";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
          <ScrollArea className="size-full">
            <Giscus
              id="comments"
              repo="helldivers-2/companion"
              repoId="R_kgDOLhSEpQ"
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
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <Drawer>
        <DrawerTrigger className="block w-full sm:hidden">
          <Button variant="outline" className="w-full">
            <IoChatbubblesOutline className="mr-2 size-4" /> Comment on this
          </Button>
        </DrawerTrigger>
        <DrawerContent className="z-[2000] max-h-[75vmax]  min-h-[75vmax]">
          <div className="p-4">
            <ScrollArea className="size-full">
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
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
