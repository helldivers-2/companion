import { Metadata } from "next";
import Container from "@/components/containerCard";
import Leaderboard from "@/components/widgets/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export default function LeaderboardPage() {
  return <Leaderboard />;
}
