import { Metadata } from "next";
import Container from "@/components/containerCard";
import AllItemsTable from "@/components/widgets/items/allItems";

export const metadata: Metadata = {
  title: "all Items",
};

export default function ItemsPage() {
  return (
    <Container title="all items">
      <AllItemsTable />
    </Container>
  );
}
