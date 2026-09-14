import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/container";
import { getPatchNote } from "@/lib/data/news";
import PatchNotesList from "@/components/widgets/news/patch-notes-list";

interface ArticlePageProps {
  params: Promise<{ gid: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { gid } = await params;
  const note = await getPatchNote(gid);
  if (note === null) return { title: "Article not found" };
  return {
    title: note.title,
    description: `Steam news from ${note.author}, published ${note.publishedAt}.`,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { gid } = await params;
  const note = await getPatchNote(gid);
  if (note === null) notFound();

  return (
    <Container>
      <div className="mx-auto max-w-3xl">
        <PatchNotesList notes={[note]} defaultExpanded titleAs="h1" />
      </div>
    </Container>
  );
}
