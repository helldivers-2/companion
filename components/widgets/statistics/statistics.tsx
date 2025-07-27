import { getAPI, REVALIDATION_TIMES } from "@/lib/get";
import millify from "millify";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsCard } from "@/components/widgets/statistics/statistics-card";

export default async function Statistics() {
  const war = await getAPI({
    url: "/v1/war",
    revalidate: REVALIDATION_TIMES.STATISTICS,
  });
  const stats = war.statistics;

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Counts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <StatisticsCard title="Patriots in Game">
              {millify(stats.playerCount)}
            </StatisticsCard>
            <StatisticsCard
              title={`Lawful Victories - Ø ${millify(stats.missionSuccessRate)}%`}
            >
              {millify(stats.missionsWon)}
            </StatisticsCard>
            <StatisticsCard title="Total Time Invested">
              {millify(stats.missionTime / 60 / 60 / 24 / 365 / 100)} centuries
            </StatisticsCard>
            <StatisticsCard title="Pesty Bugs Killed">
              {millify(stats.terminidKills)}
            </StatisticsCard>
            <StatisticsCard title="Robots Annihilated">
              {millify(stats.automatonKills)}
            </StatisticsCard>
            <StatisticsCard title="Illuminates Killed">
              {millify(stats.illuminateKills)}
            </StatisticsCard>
            <StatisticsCard title="Ammunition Shot">
              {millify(stats.bulletsFired)}
            </StatisticsCard>
            <StatisticsCard title="Fallen Souldiers">
              {millify(stats.deaths)}
            </StatisticsCard>
            <StatisticsCard title="Collateral Friend Kills">
              {millify(stats.friendlies)}
            </StatisticsCard>
            <StatisticsCard title="Missions Lost :(">
              {millify(stats.missionsLost)}
            </StatisticsCard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
