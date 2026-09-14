"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WidgetState } from "@/components/widgets/widget-state";
import { ExternalLink, Calendar, User, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PatchNote } from "@/types/news";
import { cn } from "@/lib/utils";

interface PatchNotesListProps {
  notes: PatchNote[] | null;
  /** Render every note uncollapsed, for a single-article page. */
  defaultExpanded?: boolean;
  /** h4 inside the dashboard's newsfeed card, h1 when the note is the page. */
  titleAs?: "h1" | "h4";
}

function parseContent(content: string): string {
  return content
    .replace(/\[h1\](.*?)\[\/h1\]/g, "$1\n")
    .replace(/\[h2\](.*?)\[\/h2\]/g, "$1\n")
    .replace(/\[h3\](.*?)\[\/h3\]/g, "$1\n")
    .replace(/\[b\](.*?)\[\/b\]/g, "$1")
    .replace(/\[i\](.*?)\[\/i\]/g, "$1")
    .replace(/\[u\](.*?)\[\/u\]/g, "$1")
    .replace(/\[url=([^\]]*)\](.*?)\[\/url\]/g, "$2 ($1)")
    .replace(/\[url\](.*?)\[\/url\]/g, "$1")
    .replace(/\[img\][^\[]*\[\/img\]/g, "")
    .replace(/\[previewyoutube=[^\]]*\][\s\S]*?\[\/previewyoutube\]/g, "")
    .replace(/\[list\]/g, "")
    .replace(/\[\/list\]/g, "")
    .replace(/\[\*\]/g, "• ")
    .replace(/\[\/\*\]/g, "")
    .replace(/\[p\]/g, "")
    .replace(/\[\/p\]/g, "\n\n")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractSummary(
  parsedContent: string,
  maxLength: number = 200,
): string {
  const lines = parsedContent
    .split("\n")
    .filter((line) => line.trim().length > 0);

  let summary = "";
  for (const line of lines) {
    if (line.trim().startsWith("•")) continue;
    if (line.length > 20) {
      summary = line;
      break;
    }
  }

  if (!summary) summary = lines[0] || "";

  return summary.length > maxLength
    ? summary.substring(0, maxLength).trim() + "..."
    : summary;
}

const INITIAL_COUNT = 3;

export default function PatchNotesList({
  notes,
  defaultExpanded = false,
  titleAs: Title = "h4",
}: PatchNotesListProps) {
  const [showAll, setShowAll] = useState(defaultExpanded);
  const [now] = useState(() => Date.now());

  if (notes === null || notes.length === 0) {
    return (
      <WidgetState
        icon={Calendar}
        title={
          notes === null
            ? "Unable to load the newsfeed"
            : "No newsfeed items found"
        }
        description={
          notes === null
            ? "Failed to retrieve patch notes. Please try again later."
            : "Check back later for updates."
        }
      />
    );
  }

  return (
    <>
      {!defaultExpanded && (
        <div className="flex items-center justify-between pb-4">
          <p className="text-muted-foreground">
            Latest updates and patch notes
          </p>
          <Badge variant="secondary">{notes.length} total</Badge>
        </div>
      )}
      <div className="space-y-6">
        {notes.map((note, index) => {
          const publishedDate = new Date(note.publishedAt);
          const isRecent =
            now - publishedDate.getTime() < 7 * 24 * 60 * 60 * 1000;
          const parsedContent = parseContent(note.content);
          const isOlder = index >= INITIAL_COUNT;

          if (isOlder && !showAll) return null;

          return (
            <Card
              key={note.id}
              className={cn(
                index === 0 && !defaultExpanded && "ring-2 ring-primary/30",
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <Title className="text-lg font-semibold">
                        {note.title}
                      </Title>
                      {isRecent && (
                        <Badge className="border-success/20 bg-success/10 text-xs text-success">
                          New
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="size-4" />
                        <span>{note.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-4" />
                        <time dateTime={note.publishedAt}>
                          {formatDistanceToNow(publishedDate, {
                            addSuffix: true,
                          })}
                        </time>
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="hidden sm:inline">Steam</span>
                    </a>
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {!defaultExpanded && (
                  <p className="mb-4 leading-relaxed text-muted-foreground">
                    {extractSummary(parsedContent)}
                  </p>
                )}

                <details className="group/details" open={defaultExpanded}>
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-primary-foreground transition-colors hover:underline dark:text-primary">
                    <ChevronRight className="h-4 w-4 transition-transform group-open/details:rotate-90" />
                    Read full patch notes
                  </summary>

                  <Card className="mt-3">
                    <CardContent>
                      <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap sm:text-base">
                        {parsedContent}
                      </pre>
                    </CardContent>
                  </Card>
                </details>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {notes.length > INITIAL_COUNT && (
        <div className="pt-4 text-center">
          <Button variant="outline" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show fewer updates" : "Show all updates"}
          </Button>
        </div>
      )}
    </>
  );
}
