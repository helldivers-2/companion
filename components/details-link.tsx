import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function DetailsLink({
  href,
  context,
}: {
  href: string;
  /** Read out after "Details" so screen readers know which item it opens. */
  context: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary-foreground hover:underline dark:text-primary"
    >
      Details<span className="sr-only"> for {context}</span>
      <ChevronRight aria-hidden className="size-4" />
    </Link>
  );
}
