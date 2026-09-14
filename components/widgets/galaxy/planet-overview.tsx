import Image from "next/image";
import type { Planet } from "@/types/campaigns";
import {
  getFactionIcon,
  getPlanetStats,
  getEnemyKills,
  getLeadingRegion,
  getLiberation,
  STATUS_TEXT_CLASS,
} from "@/lib/transformers/campaigns";
import { millify, formatTimeRemaining, stripHtmlTags } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function PlanetOverview({ planet }: { planet: Planet }) {
  const { liberation, regen, status } = getPlanetStats(planet);
  const icon = getFactionIcon(planet.currentOwner);
  const stats = planet.statistics;
  const enemyKills = getEnemyKills(stats);
  const leadingRegion = getLeadingRegion(planet);
  const regions = planet.regions ?? [];
  const isEvent = planet.event != null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {icon && (
          <Image
            src={icon}
            height={40}
            width={40}
            alt={`${planet.currentOwner} Icon`}
            className="size-10 shrink-0 object-contain"
          />
        )}
        <div>
          <div className="text-lg font-semibold">{planet.name}</div>
          <div className="text-sm text-muted-foreground">
            {planet.sector} Sector · {planet.currentOwner}
          </div>
        </div>
        <Badge variant="outline" className={STATUS_TEXT_CLASS[status.color]}>
          {status.text}
        </Badge>
        {planet.event && <Badge variant="outline">Event</Badge>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isEvent ? "Defense remaining" : "Liberation"}
              </span>
              <span className="font-mono">{liberation}%</span>
            </div>
            <Progress value={Number(liberation)} />
          </div>

          {!isEvent && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Regen</span>
              <span className="font-mono">{regen.toFixed(2)}%/hr</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Players</span>
            <span className="font-mono">{millify(stats.playerCount)}</span>
          </div>

          {leadingRegion && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Leading region{leadingRegion.name ? ` · ${leadingRegion.name}` : ""}
              </span>
              <span className="font-mono">
                {getLiberation(leadingRegion.health, leadingRegion.maxHealth)}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {stats.missionsWon != null && (
              <Stat label="Missions Won" value={millify(stats.missionsWon)} />
            )}
            {stats.missionsLost != null && (
              <Stat label="Missions Lost" value={millify(stats.missionsLost)} />
            )}
            {enemyKills != null && (
              <Stat label="Enemy Kills" value={millify(enemyKills)} />
            )}
            {stats.deaths != null && (
              <Stat label="Deaths" value={millify(stats.deaths)} />
            )}
          </div>

          {planet.event && (
            <>
              <Separator />
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Assaulting faction
                  </span>
                  <span>{planet.event.faction}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Defense ends</span>
                  <span className="font-mono text-xs">
                    {formatTimeRemaining(planet.event.endTime)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {regions.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-3 text-sm font-medium">Regions</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {regions.map((region, index) => {
                const regionProgress = getLiberation(
                  region.health,
                  region.maxHealth,
                );
                return (
                  <div key={`${region.name}-${index}`} className="space-y-2 border p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">
                        {region.name ?? "Unnamed Region"}
                      </span>
                      <span className="text-muted-foreground">
                        {region.size ?? ""}
                      </span>
                    </div>
                    <Progress value={Number(regionProgress)} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{regionProgress}% liberated</span>
                      <span className="font-mono">
                        {millify(region.players ?? 0)} divers
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {(planet.biome || (planet.hazards && planet.hazards.length > 0)) && (
        <>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            {planet.biome && (
              <div>
                <h3 className="text-sm font-medium">{planet.biome.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {planet.biome.description}
                </p>
              </div>
            )}
            {planet.hazards && planet.hazards.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Hazards</h3>
                <div className="space-y-2">
                  {planet.hazards.map((hazard, index) => (
                    <div key={`${hazard.name}-${index}`}>
                      <Badge variant="outline" className="text-warning">
                        {hazard.name}
                      </Badge>
                      {hazard.description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {stripHtmlTags(hazard.description)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-lg font-medium">{value}</div>
    </div>
  );
}
