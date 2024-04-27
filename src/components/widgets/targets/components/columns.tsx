"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import { species } from "../data/data";
import { Target } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { formatNumber } from "@/components/widgets/globalStats";

export const columns: ColumnDef<Target>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="w-[60px] md:w-[80px]">{row.getValue("name")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "health",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Liberation" />
    ),
    cell: ({ row }) => (
      <div className="flex w-[40px] items-center md:w-[80px]">
        <Badge className="mr-1">{Math.round(row.getValue("health"))}%</Badge>
      </div>
    ),
  },
  {
    accessorKey: "playerCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Player Count" />
    ),
    cell: ({ row }) => (
      <div className="w-[40px] md:w-[80px]">
        {formatNumber(row.getValue("playerCount"))}
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "initialOwner",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
    cell: ({ row }) => {
      const initial_owner = species.find(
        (initial_owner) => initial_owner.value === row.getValue("initialOwner"),
      );

      if (!initial_owner) {
        return null;
      }

      return (
        <div className="flex w-[40px] items-center md:w-[100px]">
          {initial_owner.icon && (
            <initial_owner.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span className="hidden md:block">{initial_owner.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
];
