import type { Planet } from "@/types/campaigns";
import Image from "next/image";
import Link from "next/link";
import {
  getFactionIcon,
  getCampaignProgress,
  getPlanetStats,
  STATUS_TEXT_CLASS,
} from "@/lib/transformers/campaigns";
import { millify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlanetFilters } from "@/components/widgets/galaxy/planet-filters";
import type { GalaxyPlanetStats } from "@/types/planets";

interface GalaxyBrowserProps {
  planets: Planet[];
  factions: string[];
  sectors: string[];
  stats: GalaxyPlanetStats;
}

const COLUMN_COUNT = 6;

export function GalaxyBrowser({
  planets,
  factions,
  sectors,
  stats,
}: GalaxyBrowserProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted-foreground">
          <span className="font-mono font-medium text-foreground">
            {stats.totalPlanets}
          </span>{" "}
          planets
        </span>
        <span className="text-muted-foreground">
          <span className="font-mono font-medium text-success">
            {stats.humanOwned}
          </span>{" "}
          held
        </span>
        <span className="text-muted-foreground">
          <span className="font-mono font-medium text-warning">
            {stats.contested}
          </span>{" "}
          contested
        </span>
        <span className="text-muted-foreground">
          <span className="font-mono font-medium text-destructive">
            {stats.activeEvents}
          </span>{" "}
          under attack
        </span>
      </div>

      <PlanetFilters factions={factions} sectors={sectors} planets={planets} />
    </div>
  );
}

export function GalaxyPlanetRow({ planet }: { planet: Planet }) {
  const progress = getCampaignProgress(planet);
  const { status } = getPlanetStats(planet);
  const count = planet.statistics?.playerCount ?? 0;
  const icon = getFactionIcon(planet.currentOwner);
  const href = planet.index != null ? `/planet/${planet.index}` : null;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {icon && (
            <Image
              src={icon}
              height={20}
              width={20}
              alt={`${planet.currentOwner} Icon`}
              className="h-5 w-5 shrink-0 object-contain"
            />
          )}
          {href ? (
            <Link href={href} className="hover:underline">
              {planet.name}
            </Link>
          ) : (
            planet.name
          )}
          {planet.event && <Badge variant="outline">Event</Badge>}
        </div>
        {progress.label && (
          <div className="pl-7 text-xs text-muted-foreground">
            {progress.label}
          </div>
        )}
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {planet.sector}
      </TableCell>
      <TableCell className="text-right text-muted-foreground">
        {millify(count)}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Progress value={Number(progress.value)} />
      </TableCell>
      <TableCell>
        <span className="font-mono text-sm">{progress.value}%</span>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant="outline" className={STATUS_TEXT_CLASS[status.color]}>
          {status.text}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

export function GalaxyPlanetTable({ planets }: { planets: Planet[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Planet</TableHead>
          <TableHead className="hidden md:table-cell">Sector</TableHead>
          <TableHead className="text-right">Players</TableHead>
          <TableHead className="hidden lg:table-cell"></TableHead>
          <TableHead>Progress</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {planets.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={COLUMN_COUNT}
              className="text-center text-muted-foreground"
            >
              No planets match these filters.
            </TableCell>
          </TableRow>
        ) : (
          planets.map((planet) => (
            <GalaxyPlanetRow
              key={planet.index ?? planet.name}
              planet={planet}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}
