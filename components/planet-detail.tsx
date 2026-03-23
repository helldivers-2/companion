"use client";

import type { Campaign } from "@/types/campaigns";
import {
  getLiberation,
  getPlanetStats,
  getFactionIcon,
} from "@/lib/get-campaigns";
import Image from "next/image";
import { millify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/use-media-query";

interface PlanetDetailProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PlanetDetailContent({ campaign }: { campaign: Campaign }) {
  const { planet } = campaign;
  const { liberation, rate, status, eta } = getPlanetStats(planet);
  const factionIcon = getFactionIcon(campaign.faction);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        {factionIcon && (
          <Image
            src={factionIcon}
            height={28}
            width={28}
            alt={`${campaign.faction} Icon`}
          />
        )}
        <div>
          <div className="text-sm font-semibold">{planet.name}</div>
          <div className="text-xs text-muted-foreground">
            {planet.sector} Sector
          </div>
        </div>
        {planet.event && <Badge variant="outline">Event</Badge>}
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Liberation</span>
          <span className="font-mono text-sm">{liberation}%</span>
        </div>
        <Progress value={Number(liberation)} />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Rate</span>
          <span className="font-mono text-sm">
            {rate >= 0 ? "+" : ""}
            {rate.toFixed(2)}%/hr
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status</span>
          <Badge variant="outline" className={status.color}>
            {status.text}
          </Badge>
        </div>
        {eta && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">ETA</span>
            <span className="font-mono text-sm text-muted-foreground">
              {eta}
            </span>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Players</span>
        <span className="font-mono text-sm">
          {millify(planet.statistics?.playerCount || 0)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Owner</span>
        <span className="text-sm">{planet.currentOwner}</span>
      </div>

      {planet.biome && (
        <>
          <Separator />
          <div>
            <div className="text-xs font-medium">{planet.biome.name}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {planet.biome.description}
            </p>
          </div>
        </>
      )}

      {planet.hazards && planet.hazards.length > 0 && (
        <>
          <Separator />
          <div>
            <div className="mb-2 text-xs font-medium">Hazards</div>
            <div className="space-y-2">
              {planet.hazards.map((hazard, i) => (
                <div key={i}>
                  <Badge variant="outline" className="text-yellow-500">
                    {hazard.name}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {hazard.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {planet.event && (
        <>
          <Separator />
          <div>
            <div className="mb-2 text-xs font-medium">Active Event</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Faction</span>
                <span className="text-sm">{planet.event.faction}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Event Health
                </span>
                <span className="font-mono text-sm">
                  {getLiberation(
                    planet.event.health,
                    planet.event.maxHealth,
                    true,
                  )}
                  %
                </span>
              </div>
              <Progress
                value={Number(
                  getLiberation(
                    planet.event.health,
                    planet.event.maxHealth,
                    true,
                  ),
                )}
              />
              {planet.event.endTime && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ends</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(planet.event.endTime).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function PlanetDetail({
  campaign,
  open,
  onOpenChange,
}: PlanetDetailProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="z-[2000]">
          {campaign && (
            <>
              <SheetHeader>
                <SheetTitle>{campaign.planet.name}</SheetTitle>
                <SheetDescription>
                  {campaign.planet.sector} Sector
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-full">
                <PlanetDetailContent campaign={campaign} />
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="z-[2000] max-h-[75vmax] min-h-[50vmax] p-4">
        {campaign && (
          <>
            <DrawerHeader>
              <DrawerTitle>{campaign.planet.name}</DrawerTitle>
              <DrawerDescription>
                {campaign.planet.sector} Sector
              </DrawerDescription>
            </DrawerHeader>
            <ScrollArea className="h-full">
              <PlanetDetailContent campaign={campaign} />
            </ScrollArea>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
