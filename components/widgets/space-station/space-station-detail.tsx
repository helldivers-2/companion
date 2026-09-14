import type { SpaceStation, TacticalAction, Cost } from "@/types/space-station";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { stripHtmlTags, formatTimeRemaining } from "@/lib/utils";

const STATUS_LABELS: Record<number, { text: string; className: string }> = {
  0: { text: "Inactive", className: "text-muted-foreground" },
  1: { text: "Active", className: "text-success" },
  2: { text: "Completed", className: "text-primary" },
  3: { text: "Failed", className: "text-destructive" },
};

function CostProgress({ cost }: { cost: Cost }) {
  const progress =
    cost.targetValue === 0 ? 0 : (cost.currentValue / cost.targetValue) * 100;
  const ratePerHour = cost.deltaPerSecond * 3600;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{cost.id}</span>
        <span className="font-mono">
          {Math.round(cost.currentValue).toLocaleString()} /{" "}
          {cost.targetValue.toLocaleString()}
        </span>
      </div>
      <Progress value={progress} />
      {ratePerHour !== 0 && (
        <div className="text-right text-xs text-muted-foreground">
          {ratePerHour >= 0 ? "+" : ""}
          {ratePerHour.toFixed(1)}/hr
        </div>
      )}
    </div>
  );
}

function ActionCard({ action }: { action: TacticalAction }) {
  const status = STATUS_LABELS[action.status] ?? STATUS_LABELS[0];

  return (
    <div className="space-y-3 border p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium">{action.name}</h4>
          <p className="text-sm text-muted-foreground">{action.description}</p>
        </div>
        <Badge variant="outline" className={status.className}>
          {status.text}
        </Badge>
      </div>

      {action.strategicDescription && (
        <p className="text-sm text-muted-foreground italic">
          {stripHtmlTags(action.strategicDescription)}
        </p>
      )}

      {action.costs.length > 0 && (
        <div className="space-y-2">
          {action.costs.map((cost) => (
            <CostProgress key={cost.id} cost={cost} />
          ))}
        </div>
      )}

      {action.statusExpire && (
        <div className="text-xs text-muted-foreground">
          {new Date(action.statusExpire) <= new Date()
            ? "Expired"
            : `Expires in ${formatTimeRemaining(action.statusExpire)}`}
        </div>
      )}
    </div>
  );
}

export default function SpaceStationDetail({
  station,
}: {
  station: SpaceStation;
}) {
  const electionEnded = new Date(station.electionEnd) <= new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Orbiting {station.planet.name}</h3>
          <div className="text-sm text-muted-foreground">
            {electionEnded ? "Election ended" : "Election ends"}
          </div>
          {!electionEnded && (
            <div className="font-mono">
              {formatTimeRemaining(station.electionEnd)}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {station.tacticalActions.length > 0 ? (
        <div className="space-y-3">
          {station.tacticalActions.map((action) => (
            <ActionCard key={action.id32} action={action} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          No tactical actions available.
        </div>
      )}
    </div>
  );
}
