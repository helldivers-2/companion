import {
  getFactionIcon,
  getLiberation,
  getLiberationRate,
  getStatus,
  getTimeToLiberation,
  getCampaignStats,
} from "@/lib/get-campaigns";
import type { Campaign, CampaignStats } from "@/types/campaigns";
import Image from "next/image";
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

export default async function CampaignTable() {
  const { activePlanets, totalPlayerCount }: CampaignStats =
    await getCampaignStats();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Planet</TableHead>
          <TableHead className="text-right text-muted-foreground">
            Players
          </TableHead>
          <TableHead>Liberation</TableHead>
          <TableHead className="hidden lg:table-cell"></TableHead>
          <TableHead className="hidden md:table-cell text-right">Rate</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="hidden lg:table-cell text-right">ETA</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activePlanets.map((campaign: Campaign, index: number) => {
          const planet = campaign.planet;
          const playerCount = planet.statistics?.playerCount || 0;
          const totalPlayerCount = activePlanets.reduce(
            (sum, c) => sum + (c.planet.statistics?.playerCount || 0),
            0,
          );
          const playerPercent =
            totalPlayerCount > 0
              ? Math.round((playerCount / totalPlayerCount) * 100)
              : 0;

          const liberation = planet.event
            ? getLiberation(planet.event.health, planet.event.maxHealth)
            : getLiberation(planet.health, planet.maxHealth);

          const maxHealth = planet.event
            ? planet.event.maxHealth
            : planet.maxHealth;
          const regenPerSecond = planet.regenPerSecond || 0;
          const rate = getLiberationRate(regenPerSecond, maxHealth);
          const status = getStatus(rate);
          const eta = getTimeToLiberation(Number(liberation), rate);

          return (
            <TableRow key={campaign.id || index}>
              <TableCell className="flex gap-2 font-medium">
                <Image
                  src={
                    getFactionIcon(campaign.faction) ||
                    "/web-app-manifest-192x192.png"
                  }
                  height={20}
                  width={20}
                  alt={`${campaign.faction} Icon`}
                  className="h-5"
                />
                {planet.name}
                {planet.event ? <Badge variant="outline">Event</Badge> : null}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {millify(playerCount)} ({playerPercent}%)
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
              <TableCell className="hidden md:table-cell text-right">
                <span className="font-mono text-sm">
                  {rate >= 0 ? "+" : ""}
                  {rate.toFixed(2)}%/hr
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className={status.color}>
                  {status.text}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-right">
                <span className="font-mono text-sm text-muted-foreground">
                  {eta || "—"}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
        <TableRow>
          <TableCell className="font-medium">Other Planets</TableCell>
          <TableCell className="text-right text-muted-foreground">
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
          <TableCell className="hidden md:table-cell text-right">
            <span className="font-mono text-sm text-muted-foreground">—</span>
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Badge variant="outline" className="text-green-500">
              Liberated
            </Badge>
          </TableCell>
          <TableCell className="hidden lg:table-cell text-right">
            <span className="font-mono text-sm text-muted-foreground">—</span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
