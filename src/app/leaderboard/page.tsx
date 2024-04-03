import { Metadata } from "next";
import Container from "@/components/containerCard";
import Leaderboard from "@/components/widgets/leaderboard";

export const metadata: Metadata = {
  title: "Stratagem Hero: Top 10 Players Leaderboard",
  description:
    "Check out the top 10 best players of Stratagem Hero, ranked by score. View their names, ranks, XP, and scores on our leaderboard.",
  keywords: "Stratagem Hero, leaderboard, top players, ranks, XP, scores",
  openGraph: {
    title: "Stratagem Hero: Top 10 Players Leaderboard",
    description:
      "Check out the top 10 best players of Stratagem Hero, ranked by score. View their names, ranks, XP, and scores on our leaderboard.",
  },
  twitter: {
    title: "Stratagem Hero: Top 10 Players Leaderboard",
    description:
      "Check out the top 10 best players of Stratagem Hero, ranked by score. View their names, ranks, XP, and scores on our leaderboard.",
  },
};

export default function LeaderboardPage() {
  return <Leaderboard />;
}
