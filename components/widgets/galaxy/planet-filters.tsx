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

const PAGE_SIZE = 25;

const FIELD_CLASS =
  "h-8 rounded-none border border-border bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50";

export function PlanetFilters({
  planets,
  factions,
  sectors,
}: PlanetFiltersProps) {
  const [faction, setFaction] = useState<string | null>(null);
  const [sector, setSector] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [eventsOnly, setEventsOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () => filterPlanets(planets, { faction, sector, query, eventsOnly }),
    [planets, faction, sector, query, eventsOnly],
  );
  const remaining = filtered.length - limit;

  // Any filter change starts the list over at the first page, so a narrowed
  // result never opens scrolled past rows the user has not seen.
  const resetLimit = () => setLimit(PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            resetLimit();
          }}
          placeholder="Search planets or sectors"
          aria-label="Search planets"
          className={`${FIELD_CLASS} w-full placeholder:text-muted-foreground sm:max-w-xs`}
        />
        {sectors.length > 0 && (
          <select
            value={sector ?? ""}
            onChange={(event) => {
              setSector(event.target.value || null);
              resetLimit();
            }}
            aria-label="Filter by sector"
            className={FIELD_CLASS}
          >
            <option value="">All sectors</option>
            {sectors.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        )}
        <Button
          variant={eventsOnly ? "default" : "outline"}
          size="sm"
          aria-pressed={eventsOnly}
          onClick={() => {
            setEventsOnly((value) => !value);
            resetLimit();
          }}
        >
          Under attack
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={faction === null ? "default" : "outline"}
          size="sm"
          aria-pressed={faction === null}
          onClick={() => {
            setFaction(null);
            resetLimit();
          }}
        >
          All
        </Button>
        {factions.map((value) => (
          <Button
            key={value}
            variant={faction === value ? "default" : "outline"}
            size="sm"
            aria-pressed={faction === value}
            onClick={() => {
              setFaction(value);
              resetLimit();
            }}
          >
            {value}
          </Button>
        ))}
      </div>

      <GalaxyPlanetTable planets={filtered.slice(0, limit)} />

      {remaining > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLimit((current) => current + PAGE_SIZE)}
          >
            Show {Math.min(PAGE_SIZE, remaining)} more ({remaining} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
