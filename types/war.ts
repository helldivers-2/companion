export interface WarStatsDto {
  statistics: {
    playerCount: number;
    missionSuccessRate: number;
    missionsWon: number;
    missionTime: number;
    terminidKills: number;
    automatonKills: number;
    illuminateKills: number;
    bulletsFired: number;
    deaths: number;
    friendlies: number;
    missionsLost: number;
  };
}

export interface WarStats {
  playerCount: number;
  missionSuccessRate: number;
  missionsWon: number;
  missionTime: number;
  terminidKills: number;
  automatonKills: number;
  illuminateKills: number;
  bulletsFired: number;
  deaths: number;
  friendlies: number;
  missionsLost: number;
}
