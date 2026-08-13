import Link from "next/link";
import { Globe } from "lucide-react";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container>
      <div className="py-12 text-center">
        <Globe className="mx-auto mb-4 h-16 w-16 text-icon" />
        <h1 className="mb-2 text-xl font-semibold">Page Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          Super Earth Command has no record of this sector.
        </p>
        <Button asChild>
          <Link href="/">Return to War Status</Link>
        </Button>
      </div>
    </Container>
  );
}
