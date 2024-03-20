import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "News",
  description: "-",
};

import RSSFeed from "@/components/rssfeed";
import Container from "@/components/containerCard";

import React from "react";

export default function Newspage() {
  return (
    <Container title="News">
      <RSSFeed />
    </Container>
  );
}
