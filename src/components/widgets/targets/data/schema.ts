import { z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const targetsSchema = z.object({
  players: z.number(),
  liberation: z.number(),

  name: z.string(),
  initial_owner: z.string(),
});

export type Target = z.infer<typeof targetsSchema>;
