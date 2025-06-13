import { getAPI } from "@/lib/get";
import { Assignment, StatusInfo } from "@/types/assignments";
import { formatDistanceToNow } from "date-fns";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { Trophy, Target, CheckCircle2, Calendar, Award } from "lucide-react";

const getProgressPercentage = (progress: number[]): number => {
  if (!progress || progress.length === 0) return 0;
  const completed = progress.filter((p) => p === 1).length;
  return (completed / progress.length) * 100;
};

const getStatusInfo = (expiration: string, progress: number[]): StatusInfo => {
  const timeLeft = new Date(expiration).getTime() - new Date().getTime();
  const progressPercent = getProgressPercentage(progress);

  if (timeLeft <= 0) {
    return { text: "EXPIRED", color: "bg-red-500" };
  }
  if (progressPercent === 100) {
    return { text: "COMPLETED", color: "bg-green-500" };
  }
  if (timeLeft < 24 * 60 * 60 * 1000) {
    return { text: "URGENT", color: "bg-orange-500" };
  }
  return { text: "ACTIVE", color: "bg-blue-500" };
};

const REWARD_TYPES: Record<number, string> = {
  1: "Medals",
  2: "Super Credits",
  3: "Samples",
  4: "Requisition",
} as const;

type RewardType = keyof typeof REWARD_TYPES;

const getRewardTypeLabel = (type: number): string => {
  return REWARD_TYPES[type as RewardType] || "Unknown Reward";
};

export default async function MajorOrder() {
  const assignments: Assignment[] = await getAPI({
    url: "/v1/assignments",
  });

  return (
    <>
      {assignments.length === 0 ? (
        <div className="py-12 text-center">
          <Target className="mx-auto mb-4 h-16 w-16 text-icon" />
          <h3 className="mb-2 text-xl font-semibold">No Major Orders Active</h3>
          <p className="text-muted-foreground">
            Super Earth Command has no active major orders at this time.
          </p>
        </div>
      ) : (
        <div>
          {assignments.map((assignment: Assignment) => {
            const progressPercent = getProgressPercentage(assignment.progress);
            const timeRemaining = formatDistanceToNow(
              new Date(assignment.expiration),
              {
                addSuffix: true,
              },
            );
            const statusInfo = getStatusInfo(
              assignment.expiration,
              assignment.progress,
            );
            const briefing = assignment.briefing;

            return (
              <div key={assignment.id}>
                <div className="space-y-3">
                  <div className="flex-1 space-y-3">
                    <p className="text-lg leading-relaxed">{briefing}</p>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <Badge
                        className={`${statusInfo.color} px-3 py-1 text-xs font-semibold tracking-wider uppercase`}
                      >
                        {statusInfo.text}
                      </Badge>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
                          Expires {timeRemaining}
                        </span>
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
                        {
                          assignment.progress.filter((p: number) => p === 1)
                            .length
                        }{" "}
                        of {assignment.progress.length} objectives completed
                      </span>
                      {progressPercent === 100 && (
                        <span className="flex items-center gap-1 font-medium text-green-600">
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
      )}
    </>
  );
}
