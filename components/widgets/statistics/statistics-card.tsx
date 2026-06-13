import { ReactNode } from "react";

interface StatisticsCardProps {
  title: string;
  children: ReactNode;
}

export function StatisticsCard({ title, children }: StatisticsCardProps) {
  return (
    <div className="rounded-none border p-4">
      <p className="text-xl">{children}</p>
      <p className="text-sm text-primary">{title}</p>
    </div>
  );
}
