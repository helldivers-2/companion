import Image from "next/image";
import { getPlanetEvents } from "@/lib/data/planets";
import {
  getFactionIcon,
  getPlanetStats,
  STATUS_TEXT_CLASS,
} from "@/lib/transformers/campaigns";
import { millify, formatTimeRemaining } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldAlert } from "lucide-react";
import { WidgetState } from "@/components/widgets/widget-state";

export default async function PlanetEvents() {
  const events = await getPlanetEvents();

  if (events === null) {
    return (
      <WidgetState
        icon={ShieldAlert}
        title="Unable to load active defenses"
        description="Please try again later."
      />
    );
  }

  if (events.length === 0) {
    return (
      <WidgetState
        icon={ShieldAlert}
        title="No active defenses"
        description="Every planet is holding. For now."
      />
    );
  }

  return (
    <div className="space-y-3">
      {events.map((planet) => {
        const { liberation, status } = getPlanetStats(planet);
        const icon = getFactionIcon(
          planet.event?.faction ?? planet.currentOwner,
        );
        const defenseRemaining = Number(liberation);

        return (
          <div
            key={planet.index ?? planet.name}
            className="border-b border-border pb-3 last:border-0 last:pb-0"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {icon && (
                  <Image
                    src={icon}
                    height={18}
                    width={18}
                    alt="Attacker icon"
                    className="h-4.5 w-4.5 shrink-0 object-contain"
                  />
                )}
                <span className="font-medium">{planet.name}</span>
                <Badge
                  variant="outline"
                  className={STATUS_TEXT_CLASS[status.color]}
                >
                  {status.text}
                </Badge>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {planet.event ? formatTimeRemaining(planet.event.endTime) : "—"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {planet.sector} Sector ·{" "}
                  {millify(planet.statistics.playerCount)} defenders
                </span>
                <span className="font-mono">{liberation}% held</span>
              </div>
              <Progress value={defenseRemaining} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
