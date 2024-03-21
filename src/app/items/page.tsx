import { promises as fs } from "fs";
import path from "path";
import { Metadata } from "next";
import Image from "next/image";
import { z } from "zod";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

import { taskSchema } from "./data/schema";

import Container from "@/components/containerCard";

export const metadata: Metadata = {
  title: "all Items",
  description: "-",
};

// Simulate a database read for tasks.
async function getTasks() {
  const data = await fs.readFile(
    path.join(process.cwd(), "/src/app/items/data/items.json"),
  );

  const tasks = JSON.parse(data.toString());

  return z.array(taskSchema).parse(tasks);
}

export default async function AllItemsPage() {
  const tasks = await getTasks();

  return (
    <Container title="all items">
      <DataTable data={tasks} columns={columns} />
    </Container>
  );
}
