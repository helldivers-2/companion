import type { Metadata } from "next";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import FAQ from "@/components/widgets/faq";

export const metadata: Metadata = {
  title: "Helldivers War Status FAQ",
  description:
    "Learn about the Galactic War status, how planet liberation works, and system requirements for Helldivers 2.",
  keywords:
    "Helldivers 2, Galactic War, planet liberation, system requirements, FAQ",
  openGraph: {
    title: "Helldivers War Status FAQ",
    description:
      "Learn about the Galactic War status, how planet liberation works, and system requirements for Helldivers 2.",
  },
  twitter: {
    title: "Helldivers War Status FAQ",
    description:
      "Learn about the Galactic War status, how planet liberation works, and system requirements for Helldivers 2.",
  },
};

export default function FAQPage() {
  const Comments = useMemo(
    () =>
      dynamic(() => import("@/components/giscusComponent"), {
        loading: () => (
          <Skeleton className="h-10 w-full animate-pulse rounded-lg bg-muted px-4 py-2" />
        ),
        ssr: false,
      }),
    [],
  );

  return (
    <>
      <FAQ />
      <Comments keyword="FAQ" reactions="0" />
    </>
  );
}
