import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

import { useTheme } from "next-themes";

interface ContainerCardProps {
  children: ReactNode;
}

export const UserMenu: React.FC<ContainerCardProps> = ({ children }) => {
  const { setTheme } = useTheme();
  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="z-[5000] w-fit">
          <Link href="/stats">
            <DropdownMenuItem>Galaxy Stats</DropdownMenuItem>
          </Link>
          <Link href="/faq">
            <DropdownMenuItem>FAQ</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span className="sr-only">Toggle theme</span>
              <p>Themes</p>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
