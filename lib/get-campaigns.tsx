import { getAPI } from "@/lib/get";
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
    icon: "/factions/Automaton.webp",
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
  const liberation = (health / maxHealth) * 100;
  const result = inverse ? 100 - liberation : liberation;
  return Math.max(0, Math.min(100, result)).toFixed(2);
};

export const getCampaignStats = async (): Promise<CampaignStats> => {
  const campaigns: Campaign[] = await getAPI({
    url: "/v1/campaigns",
  });

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
        ? getLiberation(a.planet.event.health, a.planet.event.maxHealth, true)
        : getLiberation(a.planet.health, a.planet.maxHealth);
      const bLiberation = b.planet.event
        ? getLiberation(b.planet.event.health, b.planet.event.maxHealth, true)
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
