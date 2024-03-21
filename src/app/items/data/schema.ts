import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  image: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string(),
  armorrating: z.number(),
  speed: z.number(),
  staminaregen: z.number(),
  passive: z.string(),
  cost: z.number().optional(),
})

export type Task = z.infer<typeof taskSchema>