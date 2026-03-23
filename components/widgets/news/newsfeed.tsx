import { getAPI, REVALIDATION_TIMES } from "@/lib/get";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, User, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PatchNote {
  id: string;
  title: string;
  url: string;
  author: string;
  content: string;
  publishedAt: string;
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

export default async function PatchNotes() {
  const steam = (await getAPI({
    url: "/v1/steam",
    revalidate: REVALIDATION_TIMES.NEWSFEED,
  })) as PatchNote[];

  const sortedNotes = steam.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <p className="text-muted-foreground">Latest updates and patch notes</p>
        <Badge variant="secondary">{sortedNotes.length} total</Badge>
      </div>
      <div className="space-y-6">
        {sortedNotes.map((note, index) => {
          const publishedDate = new Date(note.publishedAt);
          const isRecent =
            Date.now() - publishedDate.getTime() < 7 * 24 * 60 * 60 * 1000;
          const parsedContent = parseContent(note.content);
          const isOlder = index >= INITIAL_COUNT;

          return (
            <Card
              key={note.id}
              className={`group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                index === 0 ? "ring-2 ring-yellow-500/20" : ""
              } ${isOlder ? "hidden peer-checked:block" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold">{note.title}</h3>
                      {isRecent && (
                        <Badge className="border-green-200 bg-green-100 text-xs text-green-800">
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
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {extractSummary(parsedContent)}
                </p>

                <details className="group/details">
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
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

      {sortedNotes.length === 0 && (
        <div className="py-12 text-center">
          <div className="mb-2">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No newsfeed items found</h3>
          <p className="text-muted-foreground">Check back later for updates</p>
        </div>
      )}
    </>
  );
}
