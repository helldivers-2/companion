import { z } from "zod";

export const PatchNoteDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  author: z.string(),
  content: z.string(),
  publishedAt: z.string(),
});

export type PatchNoteDto = z.infer<typeof PatchNoteDtoSchema>;
export type PatchNote = PatchNoteDto;
