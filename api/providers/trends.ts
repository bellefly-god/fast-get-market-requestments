import type { ReportSource } from "../../src/types/demand-report";

export async function getTrendSources(): Promise<ReportSource[]> {
  // TODO: Replace placeholder implementation with live trends ingestion.
  return [
    {
      name: "Trends Provider",
      kind: "trends",
      status: "placeholder",
      detail: "TODO: connect a real trends data source.",
    },
  ];
}
