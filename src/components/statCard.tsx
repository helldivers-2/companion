import React, { ReactNode } from "react";

interface InfoDialogProps {
  title: string;
  children: ReactNode;
}

export function StatCard({ title, children }: InfoDialogProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-xl">{children}</h3>
      <p className="text-sm text-primary">{title}</p>
    </div>
  );
}
