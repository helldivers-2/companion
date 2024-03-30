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

export function NewsDialog({ title, children }: InfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{title}</Button>
      </DialogTrigger>
      <DialogContent className="h-[80vmax] max-w-[425px] md:h-[66vmin] lg:max-w-screen-md">
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
