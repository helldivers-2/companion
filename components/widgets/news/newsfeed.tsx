import { getPatchNotes } from "@/lib/data/news";
import PatchNotesList from "@/components/widgets/news/patch-notes-list";

export default async function PatchNotes() {
  const notes = await getPatchNotes();

  const sortedNotes = notes.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return <PatchNotesList notes={sortedNotes} />;
}
