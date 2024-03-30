import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InfoDialogProps {
  title: string;
  children: ReactNode;
}

import { ScrollArea } from "@/components/ui/scroll-area";

export function InfoDialog({ title, children }: InfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-0 text-base text-muted-foreground" variant="link">
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[80vmax] sm:max-w-[425px] md:h-[66vmin] lg:max-w-screen-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="w-full rounded-md border p-4">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
