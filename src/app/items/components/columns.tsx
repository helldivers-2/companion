"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import { types, priorities, statuses } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("image")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = types.find((type) => type.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {type && <Badge variant="outline">{type.label}</Badge>}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("description")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "armorrating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Armor Rating" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("armorrating")}</div>
    ),
  },
  {
    accessorKey: "speed",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Speed" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("speed")}</div>,
  },
  {
    accessorKey: "staminaregen",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stamina Regen" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("staminaregen")}</div>
    ),
  },
  {
    accessorKey: "passive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Passive" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("passive")}</div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
