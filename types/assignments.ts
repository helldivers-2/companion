export interface RewardDto {
  type: number;
  amount: number;
}

export interface AssignmentDto {
  id: string | number;
  briefing: string;
  expiration: string;
  progress: number[];
  rewards?: RewardDto[];
}

export interface Reward {
  type: number;
  amount: number;
}

export interface Assignment {
  id: string | number;
  briefing: string;
  expiration: string;
  progress: number[];
  rewards?: Reward[];
}

export interface StatusInfo {
  text: string;
  color: string;
}
