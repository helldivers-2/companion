import { getDashboardStats } from "@/lib/data/dashboard";
import { millify } from "@/lib/utils";
import { Users, Swords, ShieldAlert, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function WarSummary() {
  const stats = await getDashboardStats();

  if (stats === null) {
    return (
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">War status temporarily unavailable.</span>
        </CardContent>
      </Card>
    );
  }

  const items = [
    { icon: Users, label: "Players", value: millify(stats.playerCount) },
    { icon: Swords, label: "Active", value: String(stats.activeCount) },
    { icon: ShieldAlert, label: "Events", value: String(stats.eventCount) },
    { icon: Globe, label: "Liberated", value: String(stats.liberatedCount) },
  ];

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        {items.map(({ icon: Icon, label, value }) => (
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
