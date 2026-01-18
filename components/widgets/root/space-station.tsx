import { getAPI, REVALIDATION_TIMES } from "@/lib/get";
import type { SpaceStation, TacticalAction, Cost } from "@/types/space-station";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

async function getSpaceStations(): Promise<SpaceStation[]> {
  try {
    const stations: SpaceStation[] = await getAPI({
      url: "/v2/space-stations",
      revalidate: REVALIDATION_TIMES.GET_CAMPAIGNS,
    });
    return Array.isArray(stations) ? stations : [];
  } catch {
    return [];
  }
}

function formatTimeRemaining(endTime: string): string {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function CostProgress({ cost }: { cost: Cost }) {
  const progress = (cost.currentValue / cost.targetValue) * 100;
  const ratePerHour = cost.deltaPerSecond * 3600;

  return (
    <div className="space-y-1">
      <div className="flex justify-end text-sm">
        <span className="font-mono">
          {Math.round(cost.currentValue).toLocaleString()} /{" "}
          {cost.targetValue.toLocaleString()}
        </span>
      </div>
      <Progress value={progress} />
      {ratePerHour !== 0 && (
        <div className="text-xs text-muted-foreground text-right">
          {ratePerHour >= 0 ? "+" : ""}
          {ratePerHour.toFixed(1)}/hr
        </div>
      )}
    </div>
  );
}

function TacticalActionCard({ action }: { action: TacticalAction }) {
  const statusLabels: Record<number, { text: string; color: string }> = {
    0: { text: "Inactive", color: "text-muted-foreground" },
    1: { text: "Active", color: "text-green-500" },
    2: { text: "Completed", color: "text-blue-500" },
    3: { text: "Failed", color: "text-red-500" },
  };

  const status = statusLabels[action.status] || statusLabels[0];

  return (
    <div className="border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium">{action.name}</h4>
          <p className="text-sm text-muted-foreground">{action.description}</p>
        </div>
        <Badge variant="outline" className={status.color}>
          {status.text}
        </Badge>
      </div>

      {action.strategicDescription && (
        <p className="text-sm italic text-muted-foreground">
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
          Expires: {formatTimeRemaining(action.statusExpire)}
        </div>
      )}
    </div>
  );
}

export default async function SpaceStation() {
  const stations = await getSpaceStations();

  if (stations.length === 0) {
    return (
      <div className="text-muted-foreground text-sm p-4 text-center">
        No active space stations
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stations.map((station) => (
        <div key={station.id32} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Election ends</div>
              <div className="font-mono">
                {formatTimeRemaining(station.electionEnd)}
              </div>
            </div>
          </div>

          {station.tacticalActions.length > 0 ? (
            <div className="space-y-3">
              {(() => {
                const mostRelevantAction = station.tacticalActions.reduce((best, current) => {
                  const bestVotes = best.costs[0]?.currentValue ?? 0;
                  const currentVotes = current.costs[0]?.currentValue ?? 0;
                  return currentVotes > bestVotes ? current : best;
                }, station.tacticalActions[0]);
                return <TacticalActionCard key={mostRelevantAction.id32} action={mostRelevantAction} />;
              })()}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No active tactical actions
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
