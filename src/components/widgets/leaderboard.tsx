import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { API } from "@/components/widgets/util/getApiData";

interface Score {
  rank: number[];
  name: string[];
  experience: number[];
  score: number[];
}

function formatNumber(num: number[]) {
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
          ? (Math.abs(Number(num)) / 1.0e3).toFixed(0) + "k"
          : Math.abs(Number(num));
}

export default async function Leaderboard() {
  let scores;

  try {
    scores = await API();
  } catch (error) {
    console.error("Error fetching scores:", error);
    return (
      <div className="text-center text-muted-foreground">
        <p>Oops! There seems to be a temporary issue with the leaderboard.</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  const leaderboardData = scores.player_leaderboard;

  return (
    <Card className="w-full border border-primary bg-muted">
      <CardHeader className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-4">
        <div className="grid gap-1.5">
          <CardTitle>Leaderboard</CardTitle>
        </div>
      </CardHeader>
      <CardContent className=" p-0">
        <div className="overflow-hidden rounded-lg border border-background">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="">
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="w-24">Experience</TableHead>
                <TableHead className="w-24 text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {leaderboardData.map((score: Score, index: number) => (
                <TableRow key={index} className="bg-background font-medium">
                  <TableCell>{score.rank}</TableCell>
                  <TableCell>{score.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatNumber(score.experience)}
                  </TableCell>
                  <TableCell className="text-right">{score.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
