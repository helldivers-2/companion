import { getAPI, REVALIDATION_TIMES } from "@/lib/get";
import type { Species, Campaign, CampaignStats } from "@/types/campaigns";

export const species: Species[] = [
  {
    value: "Humans",
    icon: "/factions/Super_Earth.webp",
  },
  {
    value: "Terminids",
    icon: "/factions/Terminids.webp",
  },
  {
    value: "Automaton",
    icon: "/factions/Automatons.webp",
  },
  {
    value: "Illuminate",
    icon: "/factions/Illuminate.webp",
  },
];

export const getFactionIcon = (faction: string): string | null => {
  const factionData = species.find((s) => s.value === faction);
  return factionData ? factionData.icon : null;
};

export const getLiberation = (
  health: number,
  maxHealth: number,
  inverse: boolean = false,
): string => {
  // health = enemy control remaining
  // liberation = 100 - (health / maxHealth) * 100
  const healthPercent = (health / maxHealth) * 100;
  const result = inverse ? healthPercent : 100 - healthPercent;
  return Math.max(0, Math.min(100, result)).toFixed(2);
};

export const getLiberationRate = (
  regenPerSecond: number,
  maxHealth: number,
): number => {
  // Returns hourly rate of change (negative = losing ground)
  // regenPerSecond is enemy regeneration, so it's negative for liberation
  const hourlyRegen = regenPerSecond * 3600;
  const ratePercent = (hourlyRegen / maxHealth) * 100;
  return -ratePercent; // Negate: positive regen = negative liberation rate
};

export const getStatus = (
  rate: number,
): { text: string; color: string } => {
  if (rate > 0.5) return { text: "Gaining Ground", color: "text-green-500" };
  if (rate < -0.5) return { text: "Losing Ground", color: "text-red-500" };
  return { text: "Stalemate", color: "text-yellow-500" };
};

export const getTimeToLiberation = (
  liberation: number,
  ratePerHour: number,
): string | null => {
  if (ratePerHour <= 0) return null; // Not making progress
  const hoursRemaining = (100 - liberation) / ratePerHour;
  const minutes = Math.round(hoursRemaining * 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
};

export const getCampaignStats = async (): Promise<CampaignStats> => {
  const campaigns: Campaign[] = await getAPI({
    url: "/v1/campaigns",
    revalidate: REVALIDATION_TIMES.GET_CAMPAIGNS,
  });

  if (!Array.isArray(campaigns)) {
    throw new Error("Invalid campaign data received from API");
  }

  const campaignPlanets = campaigns.filter(
    (campaign: Campaign) =>
      campaign.planet.health < campaign.planet.maxHealth &&
      campaign.planet.event == null,
  );

  const eventPlanets = campaigns.filter(
    (campaign: Campaign) =>
      campaign.planet.event != null &&
      campaign.planet.event.health < campaign.planet.event.maxHealth,
  );

  const activePlanets = [...campaignPlanets, ...eventPlanets].sort(
    (a: Campaign, b: Campaign) => {
      const aLiberation = a.planet.event
        ? getLiberation(a.planet.event.health, a.planet.event.maxHealth)
        : getLiberation(a.planet.health, a.planet.maxHealth);
      const bLiberation = b.planet.event
        ? getLiberation(b.planet.event.health, b.planet.event.maxHealth)
        : getLiberation(b.planet.health, b.planet.maxHealth);
      return Number(aLiberation) - Number(bLiberation);
    },
  );

  const liberatedPlanets = campaigns.filter(
    (campaign: Campaign) =>
      campaign.planet.health === campaign.planet.maxHealth &&
      campaign.planet.event === null,
  );

  const totalPlayerCount = liberatedPlanets.reduce(
    (sum: number, campaign: Campaign) => {
      const playerCount = campaign.planet.statistics?.playerCount || 0;
      return sum + playerCount;
    },
    0,
  );

  return { campaigns, activePlanets, liberatedPlanets, totalPlayerCount };
};
