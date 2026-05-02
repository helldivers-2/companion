import { getAPI, REVALIDATION_TIMES } from "@/lib/get";
import PatchNotesList from "@/components/widgets/news/patch-notes-list";

interface PatchNote {
  id: string;
  title: string;
  url: string;
  author: string;
  content: string;
  publishedAt: string;
}

export default async function PatchNotes() {
  const steam = (await getAPI({
    url: "/v1/steam",
    revalidate: REVALIDATION_TIMES.NEWSFEED,
  })) as PatchNote[];

  const sortedNotes = steam.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return <PatchNotesList notes={sortedNotes} />;
}
