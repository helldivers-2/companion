import React, { ReactNode } from "react";

interface StatisticsCardProps {
  title: string;
  children: ReactNode;
}

export function StatisticsCard({ title, children }: StatisticsCardProps) {
  return (
    <div className="rounded-none border p-4">
      <h3 className="text-xl">{children}</h3>
      <p className="text-sm text-primary">{title}</p>
    </div>
  );
}
