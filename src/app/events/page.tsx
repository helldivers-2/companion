"use client";

import Container from "@/components/containerCard";

import React from "react";

import TargetsTableComponent from "./data-table-component";

const TargetsPage = () => {
  return (
    <Container title="Current Targets">
      <TargetsTableComponent />
    </Container>
  );
};

export default TargetsPage;
