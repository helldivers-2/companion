"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { uses, categories } from "../data/data";

import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";

// Helper function to convert seconds to minutes
function convertSecondsToMinutes(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "imageUrl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => (
      <div className="w-20 rounded-lg border bg-muted p-2 dark:rounded-none dark:border-transparent dark:bg-transparent dark:p-0">
        <img
          className="size-full object-cover dark:size-20"
          alt={row.getValue("imageUrl")}
          src={row.getValue("imageUrl")}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div className="w-[150px]">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "codename",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Codename" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px]">{row.getValue("codename")}</div>
    ),
  },
  {
    accessorKey: "uses",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Uses" />
    ),
    cell: ({ row }) => <div className="w-[150px]">{row.getValue("uses")}</div>,
  },
  {
    accessorKey: "activation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Activations" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px]">{row.getValue("activation")}</div>
    ),
  },
  {
    accessorKey: "cooldown",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cooldown" />
    ),
    cell: ({ row }) => {
      const cooldownInSeconds = row.getValue("cooldown") as number;
      const cooldownInMinutes = convertSecondsToMinutes(cooldownInSeconds);
      return <div className="w-\[150px\]">{cooldownInMinutes}</div>;
    },
  },
  {
    accessorKey: "uses",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Uses" />
    ),
    cell: ({ row }) => {
      const use = uses.find((use) => use.value === row.getValue("uses"));

      if (!use) {
        return null;
      }

      return (
        <Badge variant="outline">
          <span className="text-center">{use.label}</span>
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "groupId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const use = categories.find(
        (use) => use.value === row.getValue("groupId"),
      );

      if (!use) {
        return null;
      }

      return (
        <Badge variant="outline">
          <span className="text-center">{use.label}</span>
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
