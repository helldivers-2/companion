"use client";

import Giscus, { BooleanString } from "@giscus/react";

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
  reactions: BooleanString;
}

export default function Comments({ keyword, reactions }: InfoDialogProps) {
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
            <Giscus
              id="comments"
              repo="helldivers-2/companion"
              repoId="N/A"
              category="Comments"
              categoryId="N/A"
              mapping="specific"
              term={keyword}
              reactionsEnabled={reactions}
            />
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
            <Giscus
              id="comments"
              repo="helldivers-2/companion"
              repoId="N/A"
              category="Comments"
              categoryId="N/A"
              mapping="specific"
              term={keyword}
              reactionsEnabled={reactions}
            />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
