import { Satellite } from "lucide-react";
import { getSpaceStations } from "@/lib/data/space-station";
import { formatTimeRemaining } from "@/lib/utils";
import { DetailsLink } from "@/components/details-link";
import { ActionCard } from "@/components/widgets/space-station/space-station-detail";
import { WidgetState } from "@/components/widgets/widget-state";

export default async function SpaceStation() {
  const stations = await getSpaceStations();

  if (stations === null) {
    return (
      <WidgetState
        icon={Satellite}
        title="Unable to load space stations"
        description="Please try again later."
      />
    );
  }

  if (stations.length === 0) {
    return <WidgetState icon={Satellite} title="No active space stations" />;
  }

  return (
    <div className="space-y-6">
      {stations.map((station) => {
        const mostRelevantAction =
          station.tacticalActions.length > 0
            ? station.tacticalActions.reduce((best, current) => {
                const bestVotes = best.costs[0]?.currentValue ?? 0;
                const currentVotes = current.costs[0]?.currentValue ?? 0;
                return currentVotes > bestVotes ? current : best;
              })
            : null;

        const electionEnded = new Date(station.electionEnd) <= new Date();

        return (
          <div key={station.id32} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{station.planet.name}</h3>
                <div className="text-sm text-muted-foreground">
                  {electionEnded ? "Election ended" : "Election ends"}
                </div>
                {!electionEnded && (
                  <div className="font-mono">
                    {formatTimeRemaining(station.electionEnd)}
                  </div>
                )}
              </div>
              <DetailsLink
                href={`/station/${station.id32}`}
                context={`the ${station.planet.name} space station`}
              />
            </div>

            {mostRelevantAction ? (
              <ActionCard action={mostRelevantAction} />
            ) : (
              <div className="text-sm text-muted-foreground">
                No active tactical actions
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
