import { getAPI, REVALIDATION_TIMES } from "@/lib/get";
import { getCampaignStats } from "@/lib/get-campaigns";
import { millify } from "@/lib/utils";
import { Users, Swords, ShieldAlert, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WarStats {
  statistics: {
    playerCount: number;
  };
}

export default async function WarSummary() {
  const [warData, campaignStats] = await Promise.all([
    getAPI({
      url: "/v1/war",
      revalidate: REVALIDATION_TIMES.STATISTICS,
      fallback: null,
    }) as Promise<WarStats | null>,
    getCampaignStats(),
  ]);

  const playerCount = warData?.statistics?.playerCount ?? 0;
  const activeCount = campaignStats.activePlanets.length;
  const eventCount = campaignStats.activePlanets.filter(
    (c) => c.planet.event != null,
  ).length;
  const liberatedCount = campaignStats.liberatedPlanets.length;

  const stats = [
    { icon: Users, label: "Players", value: millify(playerCount) },
    { icon: Swords, label: "Active", value: String(activeCount) },
    { icon: ShieldAlert, label: "Events", value: String(eventCount) },
    { icon: Globe, label: "Liberated", value: String(liberatedCount) },
  ];

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-mono text-sm font-medium">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
