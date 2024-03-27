"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { species } from "../data/data";
import { Target } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";

export const columns: ColumnDef<Target>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("name")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "liberation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Liberation" />
    ),
    cell: ({ row }) => (
      <div className="flex w-[100px] items-center">
        <Badge className="mr-1">
          {Math.round(row.getValue("liberation"))}%
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "players",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Player Count" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("players")}</div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "initial_owner",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
    cell: ({ row }) => {
      const initial_owner = species.find(
        (initial_owner) =>
          initial_owner.value === row.getValue("initial_owner"),
      );

      if (!initial_owner) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {initial_owner.icon && (
            <initial_owner.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{initial_owner.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
