import { getAssignments } from "@/lib/data/assignments";
import {
  getStatusInfo,
  getRewardTypeLabel,
} from "@/lib/transformers/assignments";
import type { Assignment } from "@/types/assignments";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DetailsLink } from "@/components/details-link";
import { WidgetState } from "@/components/widgets/widget-state";
import { Trophy, Target, CheckCircle2, Calendar, Award } from "lucide-react";

const STATUS_BADGE_CLASS: Record<string, string> = {
  primary: "bg-primary",
  success: "bg-success text-white dark:text-background",
  warning: "bg-warning text-white dark:text-background",
  destructive: "bg-destructive text-white dark:text-background",
};

export default async function MajorOrder() {
  const assignments = await getAssignments();

  if (assignments === null) {
    return (
      <WidgetState
        icon={Target}
        title="Unable to load major orders"
        description="Failed to retrieve orders from Super Earth Command. Please try again later."
      />
    );
  }

  if (assignments.length === 0) {
    return (
      <WidgetState
        icon={Target}
        title="No major orders active"
        description="Super Earth Command has no active major orders at this time."
      />
    );
  }

  return (
    <div>
      {assignments.map((assignment: Assignment) => {
        const completedCount = assignment.progress.filter(
          (p) => p === 1,
        ).length;
        const progressPercent =
          assignment.progress.length > 0
            ? (completedCount / assignment.progress.length) * 100
            : 0;
        const timeRemaining = formatDistanceToNow(
          new Date(assignment.expiration),
          { addSuffix: true },
        );
        const statusInfo = getStatusInfo(
          assignment.expiration,
          progressPercent,
        );
        const briefing = assignment.briefing;

        return (
          <div key={assignment.id}>
            <div className="space-y-3">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-lg leading-relaxed">{briefing}</p>
                  <DetailsLink
                    href={`/assignment/${assignment.id}`}
                    context="this major order"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <Badge
                    className={`${STATUS_BADGE_CLASS[statusInfo.color]} px-3 py-1 text-xs font-semibold tracking-wider uppercase`}
                  >
                    {statusInfo.text}
                  </Badge>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Expires {timeRemaining}</span>
                  </div>

                  {assignment.rewards && assignment.rewards.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span className="font-medium">
                        {assignment.rewards[0].amount}{" "}
                        {getRewardTypeLabel(assignment.rewards[0].type)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Trophy className="h-5 w-5" />
                  Mission Progress
                </h3>
                <span className="text-sm font-semibold">
                  {Math.round(progressPercent)}% Complete
                </span>
              </div>

              <div className="space-y-2">
                <Progress value={progressPercent} className="h-3" />
                <div className="flex justify-between text-xs">
                  <span>
                    {completedCount} of {assignment.progress.length} objectives
                    completed
                  </span>
                  {progressPercent === 100 && (
                    <span className="flex items-center gap-1 font-medium text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      Mission Complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
