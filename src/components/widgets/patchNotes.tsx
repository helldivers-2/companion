"use client";

import { useState, useEffect } from "react";
import { NewsDialog } from "@/components/newsDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPatchNotes } from "@/components/widgets/util/getPatchNotes";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Item {
  date: number;
  title: string;
  contents: string;
  feedname: string;
}

export default function PatchNotes() {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 7;
  const [patchNotes, setPatchNotes] = useState<Item[]>([]);

  // Fetch patch notes data on component mount
  useEffect(() => {
    getPatchNotes().then(setPatchNotes);
  }, []);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = patchNotes.slice(firstPostIndex, lastPostIndex);

  return (
    <main className="min-h-[600px] flex-1 rounded-xl bg-background p-4">
      <div className="space-y-2">
        {currentPosts.map((item: Item, index: number) => {
          const formattedDate = new Date(item.date).toLocaleString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border p-4"
            >
              <div className="flex items-center space-x-4">
                <h3 className="font-medium">{item.title}</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden text-muted-foreground md:flex">
                  {formattedDate}
                </div>
                <NewsDialog title="Read More">
                  <div className="prose patchnotes">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {item.contents}
                    </Markdown>
                  </div>
                </NewsDialog>
              </div>
            </div>
          );
        })}
      </div>
      <PaginationSection
        totalPosts={patchNotes.length}
        postsPerPage={postsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </main>
  );
}
function PaginationSection({
  totalPosts,
  postsPerPage,
  currentPage,
  setCurrentPage,
}: {
  totalPosts: number;
  postsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}) {
  const pageNumbers = Math.ceil(totalPosts / postsPerPage);

  const handleNextPage = () => {
    if (currentPage < pageNumbers) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={handlePrevPage} />
          </PaginationItem>
          {Array.from({ length: pageNumbers }).map((_, index) => (
            <PaginationItem
              key={index}
              className={currentPage === index + 1 ? "rounded-md" : ""}
            >
              <PaginationLink onClick={() => setCurrentPage(index + 1)}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext onClick={handleNextPage} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
