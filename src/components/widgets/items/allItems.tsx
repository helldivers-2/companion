import { promises as fs } from "fs";
import path from "path";
import { Metadata } from "next";

import { z } from "zod";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { taskSchema } from "./data/schema";

export const metadata: Metadata = {
  title: "all Items",
  description: "-",
};

// Simulate a database read for tasks.
async function getItems() {
  const data = await fs.readFile(
    path.join(process.cwd(), "/src/components/widgets/items/data/items.json"),
  );

  const tasks = JSON.parse(data.toString());

  return z.array(taskSchema).parse(tasks);
}

export default async function AllItemsTable() {
  const tasks = await getItems();

  return <DataTable data={tasks} columns={columns} />;
}
