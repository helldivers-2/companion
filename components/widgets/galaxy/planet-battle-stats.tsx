import { getGalaxySummary } from "@/lib/data/war-metadata";
import { millify } from "@/lib/utils";
import { StatisticsCard } from "@/components/widgets/statistics/statistics-card";
import type { PlanetStats } from "@/types/war-metadata";

interface PlanetBattleStatsProps {
  planetIndex: number | undefined;
}

// Per-planet combat record served by /raw/api/Stats/war/{warId}/summary. That
// endpoint reports every planet in one payload, so the loader is shared and this
// widget just indexes into it.
function rowsFor(stats: PlanetStats): { label: string; value: string }[] {
  return [
    { label: "Missions Won", value: millify(stats.missionsWon) },
    { label: "Missions Lost", value: millify(stats.missionsLost) },
    {
      label: "Success Rate",
      value: `${Math.round(stats.missionSuccessRate)}%`,
    },
    {
      label: "Enemy Kills",
      value: millify(
        stats.bugKills + stats.automatonKills + stats.illuminateKills,
      ),
    },
    { label: "Deaths", value: millify(stats.deaths) },
    { label: "Friendlies Lost", value: millify(stats.friendlies) },
    { label: "Rounds Fired", value: millify(stats.bulletsFired) },
    { label: "Rounds Hit", value: millify(stats.bulletsHit) },
  ];
}

export default async function PlanetBattleStats({
  planetIndex,
}: PlanetBattleStatsProps) {
  if (planetIndex == null) return null;

  const summary = await getGalaxySummary();
  const stats = summary?.planets[planetIndex];

  if (!stats) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No battle statistics recorded for this planet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {rowsFor(stats).map((row) => (
        <StatisticsCard key={row.label} title={row.label}>
          {row.value}
        </StatisticsCard>
      ))}
    </div>
  );
}
