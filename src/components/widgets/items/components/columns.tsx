"use client";

import { ColumnDef } from "@tanstack/react-table";

import { LuInfo } from "react-icons/lu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Badge } from "@/components/ui/badge";
import { types, passives } from "../data/data";

import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

import { GiDwarfHelmet } from "react-icons/gi";
import { FaH, FaL, FaM, FaS, FaA } from "react-icons/fa6";

import { MdEngineering, MdMedicalServices } from "react-icons/md";
import { GiAbdominalArmor } from "react-icons/gi";
import { MdElectricalServices } from "react-icons/md";

{
  /*{
    accessorKey: "image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("image")}</div>,
    enableSorting: false,
    enableHiding: false,
  }, */
}

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        <img
          className="max-h-20 w-[80px] object-cover"
          alt={row.getValue("image")}
          src={`/items/${row.getValue("image")}`}
        />
      </div>
    ), //{row.getValue("image")}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div className="w-[150px]">{row.getValue("name")}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <div className="flex items-center">
        <DataTableColumnHeader column={column} title="Type" />
        <Popover>
          <PopoverTrigger>
            <LuInfo />
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <span className="flex items-baseline">
              <FaH />
              eavy Armor
            </span>
            <span className="flex items-baseline">
              <FaM />
              edium Armor
            </span>
            <span className="flex items-baseline">
              <FaL />
              ight Armor
            </span>
            <span className="flex items-baseline">
              <GiDwarfHelmet className="mr-1" /> Helmet
            </span>
          </PopoverContent>
        </Popover>
      </div>
    ),
    cell: ({ row }) => {
      const type = types.find((type) => type.value === row.getValue("type"));

      if (!type) {
        return null;
      }

      return (
        <>
          {type.icon && <type.icon className=" size-6 text-muted-foreground" />}
        </>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: false,
  },
  {
    accessorKey: "passive",
    header: ({ column }) => (
      <div className="flex items-center">
        <DataTableColumnHeader column={column} title="Passive" />
        <Popover>
          <PopoverTrigger>
            <LuInfo />
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <span>
              <FaS />
              Buff 1
            </span>
            <span>
              <FaA />
              Buff 2
            </span>
            <span>
              <MdEngineering />
              Buff 3
            </span>
            <span>
              <MdMedicalServices />
              Buff 4
            </span>
            <span>
              <GiAbdominalArmor />
              Buff 5
            </span>
            <span>
              <MdElectricalServices /> Buff 6
            </span>
          </PopoverContent>
        </Popover>
      </div>
    ),
    cell: ({ row }) => {
      const type = passives.find(
        (type) => type.value === row.getValue("passive"),
      );

      if (!type) {
        return null;
      }

      return (
        <>
          {type.icon && <type.icon className="size-6 text-muted-foreground" />}
        </>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: false,
  },
  {
    accessorKey: "armorrating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Armor Rating" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] text-center">{row.getValue("armorrating")}</div>
    ),
  },
  {
    accessorKey: "speed",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Speed" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] text-center">{row.getValue("speed")}</div>
    ),
  },
  {
    accessorKey: "staminaregen",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stamina Regen" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] text-center">{row.getValue("staminaregen")}</div>
    ),
  },
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] text-center">
        {row.getValue("cost") !== undefined ? row.getValue("cost") : "-"}
      </div>
    ),
    enableHiding: false,
  },
];
