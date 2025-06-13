export interface Species {
  value: string;
  icon: string;
}

export interface PlanetStatistics {
  playerCount?: number;
}

export interface PlanetEvent {
  health: number;
  maxHealth: number;
}

export interface Planet {
  name: string;
  health: number;
  maxHealth: number;
  statistics?: PlanetStatistics;
  event?: PlanetEvent | null;
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
  totalPlayerCount: number;
}
