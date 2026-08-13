"use client";

import { Fragment, useState } from "react";
import type { Campaign } from "@/types/campaigns";
import {
  getCampaignProgress,
  getFactionIcon,
  getPlanetStats,
  species,
  STATUS_TEXT_CLASS,
} from "@/lib/transformers/campaigns";
import Image from "next/image";
import { ChevronDown, ChevronRight } from "lucide-react";
import { millify, formatTimeRemaining } from "@/lib/utils";

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
  movingPlanets: Campaign[];
  parkedPlanets: Campaign[];
  liberatedCount: number;
  liberatedPlayerCount: number;
}

const COLUMN_COUNT = 7;

export default function CampaignTableClient({
  movingPlanets,
  parkedPlanets,
  liberatedCount,
  liberatedPlayerCount,
}: CampaignTableClientProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [factionFilter, setFactionFilter] = useState<string | null>(null);
  const [expandedFactions, setExpandedFactions] = useState<string[]>([]);

  const factions = [
    ...new Set(
      [...movingPlanets, ...parkedPlanets].map((c) => c.planet.currentOwner),
    ),
  ];

  const byFilter = (campaign: Campaign) =>
    factionFilter === null || campaign.planet.currentOwner === factionFilter;
  const moving = movingPlanets.filter(byFilter);
  const parked = parkedPlanets.filter(byFilter);

  // Share of the whole war, not of the current filter — a planet holding 3% of
  // all divers should not read as 40% just because the other fronts are hidden.
  const totalPlayerCount = [...movingPlanets, ...parkedPlanets].reduce(
    (sum, c) => sum + (c.planet.statistics?.playerCount || 0),
    0,
  );

  // Parked fronts collapse to one row per faction. Thirty rows that all read
  // "0.00% / Counterattacking / —" say the same thing thirty times; the grouped row
  // says it once and still lets you open the list.
  const parkedByFaction = factions
    .map((faction) => ({
      faction,
      campaigns: parked.filter((c) => c.planet.currentOwner === faction),
    }))
    .filter((group) => group.campaigns.length > 0);

  const handleRowClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailOpen(true);
  };

  const toggleFaction = (faction: string) => {
    setExpandedFactions((current) =>
      current.includes(faction)
        ? current.filter((f) => f !== faction)
        : [...current, faction],
    );
  };

  const renderPlanetRow = (campaign: Campaign, indented = false) => {
    const planet = campaign.planet;
    const count = planet.statistics?.playerCount || 0;
    const playerPercent =
      totalPlayerCount > 0 ? Math.round((count / totalPlayerCount) * 100) : 0;

    const { regen, status } = getPlanetStats(planet);
    const progress = getCampaignProgress(planet);

    return (
      <TableRow
        key={campaign.id ?? planet.name}
        className="cursor-pointer"
        onClick={() => handleRowClick(campaign)}
      >
        <TableCell className="font-medium">
          <div className={indented ? "flex gap-2 pl-6" : "flex gap-2"}>
            <Image
              src={
                getFactionIcon(planet.currentOwner) ||
                "/web-app-manifest-192x192.png"
              }
              height={20}
              width={20}
              alt={`${planet.currentOwner} Icon`}
              className="h-5 w-5 shrink-0 object-contain"
            />
            {planet.name}
            {planet.event ? <Badge variant="outline">Event</Badge> : null}
          </div>
          {progress.label && (
            <div
              className={
                indented
                  ? "pl-[3.5rem] text-xs text-muted-foreground"
                  : "pl-7 text-xs text-muted-foreground"
              }
            >
              {progress.label}
            </div>
          )}
        </TableCell>
        <TableCell className="text-right text-muted-foreground">
          {millify(count)} ({playerPercent}%)
        </TableCell>
        <TableCell className="hidden lg:table-cell">
          <div className="flex items-center space-x-2">
            <Progress value={Number(progress.value)} />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm">{progress.value}%</span>
          </div>
        </TableCell>
        <TableCell className="hidden text-right md:table-cell">
          <span className="font-mono text-sm text-muted-foreground">
            {planet.event ? "—" : `${regen.toFixed(2)}%/hr`}
          </span>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge variant="outline" className={STATUS_TEXT_CLASS[status.color]}>
            {status.text}
          </Badge>
        </TableCell>
        <TableCell className="hidden text-right lg:table-cell">
          <span className="font-mono text-sm text-muted-foreground">
            {planet.event ? formatTimeRemaining(planet.event.endTime) : "—"}
          </span>
        </TableCell>
      </TableRow>
    );
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
                  <Image
                    src={icon}
                    height={16}
                    width={16}
                    alt={faction}
                    className="size-4 shrink-0 object-contain"
                  />
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
            {/* The bar is lg-only, the percentage is always rendered, so the
                label belongs on the percentage or mobile loses it entirely. */}
            <TableHead className="hidden lg:table-cell"></TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="hidden text-right md:table-cell">
              Regen
            </TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden text-right lg:table-cell">
              Ends
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {moving.length === 0 && parked.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={COLUMN_COUNT}
                className="text-center text-muted-foreground"
              >
                No active campaigns.
              </TableCell>
            </TableRow>
          )}

          {moving.map((campaign) => renderPlanetRow(campaign))}

          {parkedByFaction.map(({ faction, campaigns }) => {
            const expanded = expandedFactions.includes(faction);
            const groupPlayers = campaigns.reduce(
              (sum, c) => sum + (c.planet.statistics?.playerCount || 0),
              0,
            );
            const groupPercent =
              totalPlayerCount > 0
                ? Math.round((groupPlayers / totalPlayerCount) * 100)
                : 0;
            const icon = getFactionIcon(faction);

            return (
              <Fragment key={faction}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => toggleFaction(faction)}
                >
                  <TableCell className="flex gap-2 font-medium">
                    {expanded ? (
                      <ChevronDown className="h-5 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-5 w-4 shrink-0" />
                    )}
                    {icon && (
                      <Image
                        src={icon}
                        height={20}
                        width={20}
                        alt={`${faction} Icon`}
                        className="h-5 w-5 shrink-0 object-contain"
                      />
                    )}
                    {faction}
                    <span className="text-muted-foreground">
                      ({campaigns.length})
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {millify(groupPlayers)} ({groupPercent}%)
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center space-x-2">
                      <Progress value={0} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">0.00%</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-right md:table-cell">
                    <span className="font-mono text-sm text-muted-foreground">
                      —
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-muted-foreground">
                      No progress
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-right lg:table-cell">
                    <span className="font-mono text-sm text-muted-foreground">
                      —
                    </span>
                  </TableCell>
                </TableRow>
                {expanded &&
                  campaigns.map((campaign) => renderPlanetRow(campaign, true))}
              </Fragment>
            );
          })}

          {liberatedCount > 0 && factionFilter === null && (
            <TableRow>
              <TableCell className="font-medium">
                Liberated Planets{" "}
                <span className="text-muted-foreground">
                  ({liberatedCount})
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {millify(liberatedPlayerCount)}
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
              <TableCell className="hidden text-right md:table-cell">
                <span className="font-mono text-sm text-muted-foreground">
                  —
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className="text-success">
                  Liberated
                </Badge>
              </TableCell>
              <TableCell className="hidden text-right lg:table-cell">
                <span className="font-mono text-sm text-muted-foreground">
                  —
                </span>
              </TableCell>
            </TableRow>
          )}
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
