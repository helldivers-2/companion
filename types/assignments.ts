import { z } from "zod";

export const RewardDtoSchema = z.object({
  type: z.number(),
  amount: z.number(),
});

export const AssignmentDtoSchema = z.object({
  id: z.union([z.string(), z.number()]),
  briefing: z.string(),
  expiration: z.string(),
  progress: z.array(z.number()),
  rewards: z.array(RewardDtoSchema).optional(),
});

export type RewardDto = z.infer<typeof RewardDtoSchema>;
export type AssignmentDto = z.infer<typeof AssignmentDtoSchema>;

export type Reward = RewardDto;
export type Assignment = AssignmentDto;

export interface StatusInfo {
  text: string;
  color: string;
}
