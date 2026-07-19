"use client";

import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container>
      <div className="py-12 text-center">
        <ShieldAlert className="mx-auto mb-4 h-16 w-16 text-icon" />
        <h1 className="mb-2 text-xl font-semibold">Something Went Wrong</h1>
        <p className="mb-6 text-muted-foreground">
          Super Earth Command lost contact. Please try again.
        </p>
        <Button onClick={() => reset()}>Try Again</Button>
      </div>
    </Container>
  );
}
