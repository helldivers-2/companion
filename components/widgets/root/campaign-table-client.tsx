"use client";

import { useState } from "react";
import type { Campaign } from "@/types/campaigns";
import {
  getFactionIcon,
  getPlanetStats,
  species,
} from "@/lib/get-campaigns";
import Image from "next/image";
import { millify } from "@/lib/utils";

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
import { Button } from "@/components/ui/button";
import PlanetDetail from "@/components/planet-detail";

interface CampaignTableClientProps {
  activePlanets: Campaign[];
  totalPlayerCount: number;
}

export default function CampaignTableClient({
  activePlanets,
  totalPlayerCount,
}: CampaignTableClientProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [factionFilter, setFactionFilter] = useState<string | null>(null);

  const factions = [...new Set(activePlanets.map((c) => c.faction))];

  const filtered = factionFilter
    ? activePlanets.filter((c) => c.faction === factionFilter)
    : activePlanets;

  const filteredPlayerCount = filtered.reduce(
    (sum, c) => sum + (c.planet.statistics?.playerCount || 0),
    0,
  );

  const handleRowClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailOpen(true);
  };

  return (
    <>
      {factions.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <Button
            variant={factionFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFactionFilter(null)}
          >
            All
          </Button>
          {factions.map((faction) => {
            const icon = species.find((s) => s.value === faction)?.icon;
            return (
              <Button
                key={faction}
                variant={factionFilter === faction ? "default" : "outline"}
                size="sm"
                onClick={() => setFactionFilter(faction)}
                className="gap-1.5"
              >
                {icon && (
                  <Image src={icon} height={16} width={16} alt={faction} />
                )}
                {faction}
              </Button>
            );
          })}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Planet</TableHead>
            <TableHead className="text-right text-muted-foreground">
              Players
            </TableHead>
            <TableHead>Liberation</TableHead>
            <TableHead className="hidden lg:table-cell"></TableHead>
            <TableHead className="hidden md:table-cell text-right">
              Rate
            </TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden lg:table-cell text-right">
              ETA
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((campaign: Campaign, index: number) => {
            const planet = campaign.planet;
            const playerCount = planet.statistics?.playerCount || 0;
            const playerPercent =
              filteredPlayerCount > 0
                ? Math.round((playerCount / filteredPlayerCount) * 100)
                : 0;

            const { liberation, rate, status, eta } = getPlanetStats(planet);

            return (
              <TableRow
                key={campaign.id || index}
                className="cursor-pointer"
                onClick={() => handleRowClick(campaign)}
              >
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
                  {planet.event ? (
                    <Badge variant="outline">Event</Badge>
                  ) : null}
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
              <span className="font-mono text-sm text-muted-foreground">
                —
              </span>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge variant="outline" className="text-green-500">
                Liberated
              </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell text-right">
              <span className="font-mono text-sm text-muted-foreground">
                —
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <PlanetDetail
        campaign={selectedCampaign}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
