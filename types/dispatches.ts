import { z } from "zod";

export const DispatchDtoSchema = z.object({
  id: z.number(),
  published: z.string(),
  type: z.number(),
  message: z.string(),
});

export type DispatchDto = z.infer<typeof DispatchDtoSchema>;
export type Dispatch = DispatchDto;
