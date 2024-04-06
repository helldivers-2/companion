import { API } from "@/components/widgets/util/getApiData";
import { StatCard } from "@/components/statCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function formatNumber(num: number) {
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

  const galaxy_stats = stats.planetStats.galaxy_stats;

  const calculateTotalPlayers = (stats: any): number => {
    let totalPlayers = 0;

    // Iterate through each planet
    stats.status.planetStatus.forEach((planet: any) => {
      totalPlayers += planet.players;
    });

    return totalPlayers;
  };

  const missionTimeHours = convertToHours(galaxy_stats.missionTime);
  const formattedMissionTimeHours = formatNumber(missionTimeHours);

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="col-span-1 md:col-span-2">
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <StatCard title="patriots currently active">
              {formatNumber(calculateTotalPlayers(stats))}
            </StatCard>
            <StatCard title="lawfull Victories">
              {formatNumber(galaxy_stats.missionsWon)}
            </StatCard>
            <StatCard title="Time invested">
              {formattedMissionTimeHours} hours
            </StatCard>
            <StatCard title="pesty bugs killed">
              {formatNumber(galaxy_stats.bugKills)}
            </StatCard>
            <StatCard title="Robots annihilated">
              {formatNumber(galaxy_stats.automatonKills)}
            </StatCard>
            <StatCard title="Illuminates killed?!">
              {formatNumber(galaxy_stats.illuminateKills)}
            </StatCard>
            <StatCard title="Ammunition shot">
              {formatNumber(galaxy_stats.bulletsFired)}
            </StatCard>
            <StatCard title="fallen Souldiers">
              {formatNumber(galaxy_stats.deaths)}
            </StatCard>
            <StatCard title="collateral friend kills">
              {formatNumber(galaxy_stats.friendlies)}
            </StatCard>
            <StatCard title="missions lost :(">
              {formatNumber(galaxy_stats.missionsLost)}
            </StatCard>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <StatCard title="average reinforces">
              {formatNumber(galaxy_stats.revives)}
            </StatCard>
            <StatCard title="average mission success">
              {formatNumber(galaxy_stats.missionSuccessRate)}
            </StatCard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
