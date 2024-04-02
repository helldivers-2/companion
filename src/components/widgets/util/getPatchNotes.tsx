// getPatchNotes.tsx
import { API } from "@/components/widgets/util/getApiData";

interface Item {
  date: number;
  title: string;
  contents: string;
  feedname: string;
}

export async function getPatchNotes() {
  const updates = await API();
  return updates.updates as Item[];
}
