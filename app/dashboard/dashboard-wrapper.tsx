"use client";

import DashboardPage from "./page";

export default function DashboardWrapper() {
  const date_to = new Date().toISOString().split("T")[0];
  const date_from = new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .split("T")[0];

  return <DashboardPage dateFrom={date_from} dateTo={date_to} />;
}
