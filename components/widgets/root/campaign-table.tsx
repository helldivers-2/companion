import {
  getFactionIcon,
  getLiberation,
  getCampaignStats,
} from "@/lib/get-campaigns";
import millify from "millify";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default async function CurrentTargets() {
  const { activePlanets, totalPlayerCount } = await getCampaignStats();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Planet</TableHead>
          <TableHead className="text-right">Players</TableHead>
          <TableHead>Liberation</TableHead>
          <TableHead className="hidden lg:table-cell"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activePlanets.map((campaign: any, index: number) => {
          const planet = campaign.planet;
          const playerCount = planet.statistics?.playerCount || 0;

          const campaignLiberation = getLiberation(
            planet.health,
            planet.maxHealth,
          );
          const eventLiberation = planet.event
            ? getLiberation(planet.event.health, planet.event.maxHealth, true)
            : null;
          const liberation = planet.event
            ? eventLiberation
            : campaignLiberation;

          return (
            <TableRow key={campaign.id || index}>
              <TableCell className="flex gap-2 font-medium">
                <img
                  src={
                    getFactionIcon(campaign.faction) ||
                    "/web-app-manifest-192x192.png"
                  }
                  alt="Faction Icon"
                  className="h-5"
                />
                {planet.name}
                {planet.event ? <Badge variant="outline">Event</Badge> : null}
              </TableCell>
              <TableCell className="text-right">
                {millify(playerCount)}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center space-x-2">
                  <Progress value={Number(liberation)} />
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
          <TableCell className="hidden lg:table-cell">
            <div className="flex items-center space-x-2">
              <Progress value={100} />
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
