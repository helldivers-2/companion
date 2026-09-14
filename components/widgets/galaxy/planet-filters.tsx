"use client";

import { useMemo, useState } from "react";
import type { Planet } from "@/types/campaigns";
import { filterPlanets } from "@/lib/transformers/planets";
import { Button } from "@/components/ui/button";
import { GalaxyPlanetTable } from "@/components/widgets/galaxy/galaxy-browser";

interface PlanetFiltersProps {
  planets: Planet[];
  factions: string[];
  sectors: string[];
}

export function PlanetFilters({ planets, factions, sectors }: PlanetFiltersProps) {
  const [faction, setFaction] = useState<string | null>(null);
  const [sector, setSector] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [eventsOnly, setEventsOnly] = useState(false);

  const filtered = useMemo(
    () => filterPlanets(planets, { faction, sector, query, eventsOnly }),
    [planets, faction, sector, query, eventsOnly],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search planets or sectors"
          aria-label="Search planets"
          className="h-8 w-full rounded-none border border-border bg-background px-2.5 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 sm:max-w-xs"
        />
        <Button
          variant={eventsOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setEventsOnly((value) => !value)}
        >
          Under attack
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={faction === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFaction(null)}
        >
          All
        </Button>
        {factions.map((value) => (
          <Button
            key={value}
            variant={faction === value ? "default" : "outline"}
            size="sm"
            onClick={() => setFaction(value)}
          >
            {value}
          </Button>
        ))}
      </div>

      {sectors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={sector === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSector(null)}
          >
            All Sectors
          </Button>
          {sectors.map((value) => (
            <Button
              key={value}
              variant={sector === value ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSector(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      )}

      <GalaxyPlanetTable planets={filtered} />
    </div>
  );
}
