import { getAPI } from "@/lib/get";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bug, Bot, PersonStanding } from "lucide-react";
import millify from "millify";

export const species = [
  {
    value: "Humans",
    label: "Humans",
    icon: "/factions/Super_Earth.webp",
  },
  {
    value: "Terminids",
    label: "Terminids",
    icon: "/factions/Terminids.webp",
  },
  {
    value: "Automaton",
    label: "Automaton",
    icon: "/factions/Automaton.webp",
  },
  {
    value: "Illuminate",
    label: "Illuminate",
    icon: "/factions/Illuminate.webp",
  },
];

const getFactionIcon = (faction: string): string | null => {
  const factionData = species.find((s) => s.value === faction);
  return factionData ? factionData.icon : null;
};

const getLiberation = (health: number, maxHealth: number) => {
  const liberation = (health / maxHealth) * 100;
  return Math.max(0, Math.min(100, liberation)).toFixed(2);
};

export default async function CurrentTargets() {
  const campaigns = await getAPI({
    url: "/v1/campaigns",
  });

  const activePlanets = campaigns
    .filter(
      (campaign: any) => campaign.planet.health < campaign.planet.maxHealth,
    )
    .sort((a: any, b: any) => {
      const liberationA = getLiberation(a.planet.health, a.planet.maxHealth);
      const liberationB = getLiberation(b.planet.health, b.planet.maxHealth);
      return parseFloat(liberationA) - parseFloat(liberationB);
    });
  const liberatedPlanets = campaigns.filter(
    (campaign: any) => campaign.planet.health === campaign.planet.maxHealth,
  );

  const totalPlayerCount = liberatedPlanets.reduce(
    (sum: number, campaign: any) => {
      const playerCount = campaign.planet.statistics?.playerCount || 0;
      return sum + playerCount;
    },
    0,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Planet</TableHead>
          <TableHead className="text-right">Players</TableHead>
          <TableHead>Liberation</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activePlanets.map((campaign: any, index: number) => {
          const planet = campaign.planet;
          const liberation = getLiberation(planet.health, planet.maxHealth);
          const playerCount = planet.statistics?.playerCount || 0;

          return (
            <TableRow key={campaign.id || index}>
              <TableCell className="flex gap-2 font-medium">
                <img
                  src={
                    getFactionIcon(planet.currentOwner) || "/web-app-manifest-192x192.png"
                  }
                  alt="Faction Icon"
                  className="h-5 w-5"
                />
                {planet.name}
              </TableCell>
              <TableCell className="text-right">
                {millify(playerCount)}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${liberation}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">{liberation}%</span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        <TableRow>
          <TableCell className="font-medium">other Planets</TableCell>
          <TableCell className="text-right">
            {millify(totalPlayerCount)}
          </TableCell>
          <TableCell>
            <div className="flex items-center space-x-2">
              <div className="h-2 flex-1 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `100%` }}
                />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm">100%</span>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
