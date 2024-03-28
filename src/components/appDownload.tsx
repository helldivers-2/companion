import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { LuDownload } from "react-icons/lu";

export default function AppDownload() {
  return (
    <div className="fixed bottom-4 left-4 z-[1500]">
      <Dialog>
        <DialogTrigger>
          <Button className=" flex md:hidden" variant="outline" size="icon">
            <LuDownload />
          </Button>
          <Button className="hidden md:flex" variant="outline">
            <LuDownload className="mr-2" /> get the Webapp
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>get the Webapp</DialogTitle>
            <DialogDescription>Instructions coming soon...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
