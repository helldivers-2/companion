import { API } from "@/components/widgets/util/getApiData";

function formatNumber(num: number) {
  // Nine Zeroes for Billions
  return Math.abs(Number(num)) >= 1.0e12
    ? (Math.abs(Number(num)) / 1.0e12).toFixed(1) + " Tr"
    : // Six Zeroes for Billions
      Math.abs(Number(num)) >= 1.0e9
      ? (Math.abs(Number(num)) / 1.0e9).toFixed(1) + " B"
      : // Three Zeroes for Millions
        Math.abs(Number(num)) >= 1.0e6
        ? (Math.abs(Number(num)) / 1.0e6).toFixed(1) + " M"
        : // Three Zeroes for Thousands
          Math.abs(Number(num)) >= 1.0e3
          ? (Math.abs(Number(num)) / 1.0e3).toFixed(1) + "k"
          : Math.abs(Number(num));
}

const convertToHours = (missionTime: number) => {
  // Assuming missionTime is in seconds, convert it to hours
  const hours = missionTime / 3600; // 1 hour = 3600 seconds
  return hours;
};

export default async function StatsWidget() {
  const stats = await API();

  const calculateTotalPlayers = (stats: any): number => {
    let totalPlayers = 0;

    // Iterate through each planet
    stats.status.planetStatus.forEach((planet: any) => {
      totalPlayers += planet.players;
    });

    return totalPlayers;
  };

  const missionTimeHours = convertToHours(
    stats.planetStats.galaxy_stats.missionTime,
  );
  const formattedMissionTimeHours = formatNumber(missionTimeHours);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <div className="rounded-lg border p-4">
        <h3 className="text-xl">
          {formatNumber(calculateTotalPlayers(stats))}
        </h3>
        <p className="text-sm text-primary">patriots currently active</p>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="text-xl">
          {formatNumber(stats.planetStats.galaxy_stats.missionsWon)}
        </h3>
        <p className="text-sm text-primary">lawfull Victories</p>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="text-xl">{formattedMissionTimeHours} hours</h3>
        <p className="text-sm text-primary">Time invested</p>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="text-xl">
          {formatNumber(stats.planetStats.galaxy_stats.bugKills)}
        </h3>
        <p className="text-sm text-primary">pesty bugs killed</p>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="text-xl">
          {formatNumber(stats.planetStats.galaxy_stats.automatonKills)}
        </h3>
        <p className="text-sm text-primary">Robots annihilated</p>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="text-xl">
          {formatNumber(stats.planetStats.galaxy_stats.bulletsFired)}
        </h3>
        <p className="text-sm text-primary">Ammunition shot</p>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="text-xl">
          {formatNumber(stats.planetStats.galaxy_stats.deaths)}
        </h3>
        <p className="text-sm text-primary">fallen Souldiers</p>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="text-xl">
          {formatNumber(stats.planetStats.galaxy_stats.friendlies)}
        </h3>
        <p className="text-sm text-primary">collateral friend kills</p>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="text-xl">
          {formatNumber(stats.planetStats.galaxy_stats.missionsLost)}
        </h3>
        <p className="text-sm text-primary">attemptes to liberate the Creek</p>
      </div>
    </div>
  );
}
{
  /*      <div className="mx-2 flex justify-between text-muted-foreground">
        {targets.warSeason.activePlayers} People on {filteredPlanets.length}{" "}
        planets
        <a href="https://github.com/dealloc/helldivers2-api">Source</a>
      </div> */
}
