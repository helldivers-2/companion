"use client";

import Giscus from "@giscus/react";

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { MessagesSquare } from "lucide-react";

interface InfoDialogProps {
  keyword: string;
}

export default function Comments({ keyword }: InfoDialogProps) {
  return (
    <div className="mt-10">
      <Sheet>
        <SheetTrigger asChild className="hidden w-full sm:flex">
          <Button variant="outline">
            <MessagesSquare className="mr-2 size-4" /> Comment on this
          </Button>
        </SheetTrigger>
        <SheetContent className="z-[2000]">
          <SheetTitle className="p-4">Comments</SheetTitle>

          <ScrollArea className="size-full p-4">
            <GiscusData term={keyword} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <Drawer>
        <DrawerTrigger asChild className="flex w-full sm:hidden">
          <Button variant="outline">
            <MessagesSquare className="mr-2 size-4" /> Comment on this
          </Button>
        </DrawerTrigger>
        <DrawerContent className="z-[2000] max-h-[75vmax] min-h-[75vmax] p-4">
          <DrawerTitle className="p-4">Comments</DrawerTitle>
          
          <ScrollArea className="size-full">
            <GiscusData term={keyword}
            />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

const GiscusData = ({ term } : { term: string }) => {
  return (
    <Giscus
      repo="helldivers-2/companion"
      repoId="R_kgDOLhSEpQ"
      category="Comments"
      categoryId="DIC_kwDOLhSEpc4CeV8r"
      mapping="specific"
      term={term}
      strict={0}
      reactionsEnabled={0}
      emitMetadata={0}
      inputPosition="top"
      theme="preferred_color_scheme"
      lang="en"
      loading="lazy"
    />
  );
};