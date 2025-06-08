import { StatisticsAPI } from "@/lib/get";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsCard } from "@/components/widgets/statistics/statistics-card";

export function formatNumber(num: number) {
  return Math.abs(Number(num)) >= 1.0e12
    ? (Math.abs(Number(num)) / 1.0e12).toFixed(1) + " Tr"
    : Math.abs(Number(num)) >= 1.0e9
      ? (Math.abs(Number(num)) / 1.0e9).toFixed(1) + " B"
      : Math.abs(Number(num)) >= 1.0e6
        ? (Math.abs(Number(num)) / 1.0e6).toFixed(1) + " M"
        : Math.abs(Number(num)) >= 1.0e3
          ? (Math.abs(Number(num)) / 1.0e3).toFixed(1) + "k"
          : Math.abs(Number(num));
}

const convertToHours = (missionTime: number) => {
  const hours = missionTime / 3600; // 1 hour = 3600 seconds
  return hours;
};

export default async function Statistics() {
  const data = await StatisticsAPI();
  const stats = data.statistics;

  const formattedMissionTimeHours = formatNumber(
    convertToHours(stats.missionTime),
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Counts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <StatisticsCard title="Patriots in Game">
              {formatNumber(stats.playerCount)}
            </StatisticsCard>
            <StatisticsCard
              title={`Lawful Victories - Ø ${formatNumber(stats.missionSuccessRate)}%`}
            >
              {formatNumber(stats.missionsWon)}
            </StatisticsCard>
            <StatisticsCard title="Time Invested">
              {formattedMissionTimeHours} hours
            </StatisticsCard>
            <StatisticsCard title="Pesty Bugs Killed">
              {formatNumber(stats.terminidKills)}
            </StatisticsCard>
            <StatisticsCard title="Robots Annihilated">
              {formatNumber(stats.automatonKills)}
            </StatisticsCard>
            <StatisticsCard title="Illuminates Killed">
              {formatNumber(stats.illuminateKills)}
            </StatisticsCard>
            <StatisticsCard title="Ammunition Shot">
              {formatNumber(stats.bulletsFired)}
            </StatisticsCard>
            <StatisticsCard title="Fallen Souldiers">
              {formatNumber(stats.deaths)}
            </StatisticsCard>
            <StatisticsCard title="Collateral Friend Kills">
              {formatNumber(stats.friendlies)}
            </StatisticsCard>
            <StatisticsCard title="Missions Lost :(">
              {formatNumber(stats.missionsLost)}
            </StatisticsCard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
