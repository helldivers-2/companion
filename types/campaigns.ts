export interface Species {
  value: string;
  icon: string;
}

export interface PlanetPositionDto {
  x: number;
  y: number;
}

export interface PlanetStatisticsDto {
  playerCount: number;
}

export interface PlanetEventDto {
  id: number;
  eventType: number;
  faction: string;
  health: number;
  maxHealth: number;
  startTime: string;
  endTime: string;
}

export interface PlanetDto {
  name: string;
  sector: string;
  position: PlanetPositionDto;
  health: number;
  maxHealth: number;
  regenPerSecond: number;
  currentOwner: string;
  initialOwner: string;
  statistics: PlanetStatisticsDto;
  event?: PlanetEventDto | null;
  biome?: { name: string; description: string };
  hazards?: { name: string; description: string }[];
}

export interface CampaignDto {
  id?: string | number;
  planet: PlanetDto;
  faction: string;
}

export interface PlanetPosition {
  x: number;
  y: number;
}

export interface PlanetStatistics {
  playerCount: number;
}

export interface PlanetEvent {
  id: number;
  eventType: number;
  faction: string;
  health: number;
  maxHealth: number;
  startTime: string;
  endTime: string;
}

export interface Planet {
  name: string;
  sector: string;
  position: PlanetPosition;
  health: number;
  maxHealth: number;
  regenPerSecond: number;
  currentOwner: string;
  initialOwner: string;
  statistics: PlanetStatistics;
  event?: PlanetEvent | null;
  biome?: { name: string; description: string };
  hazards?: { name: string; description: string }[];
}

export interface Campaign {
  id?: string | number;
  planet: Planet;
  faction: string;
}

export interface CampaignStats {
  campaigns: Campaign[];
  activePlanets: Campaign[];
  liberatedPlanets: Campaign[];
  liberatedPlayerCount: number;
}
