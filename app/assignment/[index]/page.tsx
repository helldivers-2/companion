import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/container";
import { DashboardCard } from "@/components/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAssignment } from "@/lib/data/assignments";
import {
  getStatusInfo,
  getRewardTypeLabel,
} from "@/lib/transformers/assignments";
import { formatDistanceToNow } from "date-fns";

interface AssignmentPageProps {
  params: Promise<{ index: string }>;
}

export async function generateMetadata({
  params,
}: AssignmentPageProps): Promise<Metadata> {
  const { index } = await params;
  if (!/^\d+$/.test(index)) return { title: "Major order not found" };
  const assignment = await getAssignment(index);
  if (assignment === null) return { title: "Major order not found" };
  return {
    title: assignment.title ?? "Major Order",
    description: assignment.briefing.slice(0, 160),
  };
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
  const { index } = await params;
  if (!/^\d+$/.test(index)) notFound();

  const assignment = await getAssignment(index);
  if (assignment === null) notFound();

  const completedCount = assignment.progress.filter((p) => p === 1).length;
  const progressPercent =
    assignment.progress.length > 0
      ? (completedCount / assignment.progress.length) * 100
      : 0;
  const statusInfo = getStatusInfo(assignment.expiration, progressPercent);

  return (
    <Container title={assignment.title ?? "Major Order"} as="h1">
      <DashboardCard title="Directive">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="outline" className="text-muted-foreground">
              {statusInfo.text}
            </Badge>
            <span className="text-muted-foreground">
              Expires{" "}
              {formatDistanceToNow(new Date(assignment.expiration), {
                addSuffix: true,
              })}
            </span>
            {assignment.rewards && assignment.rewards.length > 0 && (
              <span className="text-muted-foreground">
                Reward: {assignment.rewards[0].amount}{" "}
                {getRewardTypeLabel(assignment.rewards[0].type)}
              </span>
            )}
          </div>

          <p className="leading-relaxed">{assignment.briefing}</p>

          {assignment.description && (
            <p className="text-sm text-muted-foreground">
              {assignment.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono">
                {completedCount} of {assignment.progress.length} objectives
              </span>
            </div>
            <Progress value={progressPercent} />
          </div>
        </div>
      </DashboardCard>
    </Container>
  );
}
