import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getDispatch } from "@/lib/data/dispatches";
import {
  getDispatchTypeInfo,
  parseContent,
  stripDispatchHeadline,
} from "@/lib/transformers/dispatches";
import { formatDistanceToNow } from "date-fns";

interface DispatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: DispatchPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return { title: "Dispatch not found" };
  const dispatch = await getDispatch(id);
  if (dispatch === null) return { title: "Dispatch not found" };
  return {
    title: `Dispatch #${dispatch.id}`,
    description: parseContent(dispatch.message).slice(0, 160),
  };
}

export default async function DispatchPage({ params }: DispatchPageProps) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const dispatch = await getDispatch(id);
  if (dispatch === null) notFound();

  const typeInfo = getDispatchTypeInfo(dispatch.message);
  const Icon = typeInfo.icon;

  return (
    <Container title={`Dispatch #${dispatch.id}`} as="h1">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className={`${typeInfo.color} font-medium`}>
            <Icon className="mr-1.5 h-3 w-3" />
            {typeInfo.label}
          </Badge>
          <time
            dateTime={dispatch.published}
            className="text-xs text-muted-foreground"
          >
            {formatDistanceToNow(new Date(dispatch.published), {
              addSuffix: true,
            })}
          </time>
        </div>
        <p className="text-lg leading-relaxed">
          {stripDispatchHeadline(parseContent(dispatch.message))}
        </p>
      </div>
    </Container>
  );
}
