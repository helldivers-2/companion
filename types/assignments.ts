import { z } from "zod";

export const RewardDtoSchema = z.object({
  type: z.number(),
  amount: z.number(),
});

export const TaskDtoSchema = z.object({
  type: z.number(),
  values: z.array(z.number()),
  valueTypes: z.array(z.number()).optional(),
});

export const AssignmentDtoSchema = z.object({
  id: z.union([z.string(), z.number()]),
  briefing: z.string(),
  expiration: z.string(),
  progress: z.array(z.number()),
  rewards: z.array(RewardDtoSchema).optional(),
  // Present on the live payload but not part of the original model; optional so
  // older fixtures still validate.
  title: z.string().nullish(),
  description: z.string().nullish(),
  tasks: z.array(TaskDtoSchema).optional(),
});

export type RewardDto = z.infer<typeof RewardDtoSchema>;
export type TaskDto = z.infer<typeof TaskDtoSchema>;
export type AssignmentDto = z.infer<typeof AssignmentDtoSchema>;
export type AssignmentDtoInput = z.input<typeof AssignmentDtoSchema>;

export type Reward = RewardDto;
export type Task = TaskDto;
export type Assignment = AssignmentDto;

export interface StatusInfo {
  text: string;
  color: string;
}
