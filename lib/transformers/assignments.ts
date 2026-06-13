import type {
  AssignmentDto,
  Assignment,
  StatusInfo,
} from "@/types/assignments";

export function mapAssignmentDto(dto: AssignmentDto): Assignment {
  return {
    id: dto.id,
    briefing: dto.briefing,
    expiration: dto.expiration,
    progress: dto.progress,
    rewards: dto.rewards
      ? dto.rewards.map((r) => ({ type: r.type, amount: r.amount }))
      : undefined,
  };
}

const REWARD_TYPES: Record<number, string> = {
  1: "Medals",
  2: "Super Credits",
  3: "Samples",
  4: "Requisition",
};

type RewardType = keyof typeof REWARD_TYPES;

export function getRewardTypeLabel(type: number): string {
  return REWARD_TYPES[type as RewardType] || "Unknown Reward";
}

export function getStatusInfo(
  expiration: string,
  progressPercent: number,
): StatusInfo {
  const timeLeft = new Date(expiration).getTime() - new Date().getTime();
  if (timeLeft <= 0) return { text: "EXPIRED", color: "bg-red-500" };
  if (progressPercent === 100)
    return { text: "COMPLETED", color: "bg-green-500" };
  if (timeLeft < 24 * 60 * 60 * 1000)
    return { text: "URGENT", color: "bg-orange-500" };
  return { text: "ACTIVE", color: "bg-blue-500" };
}
