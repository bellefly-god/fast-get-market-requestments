import { mockDemandReport } from "../../../src/data/mock-demand-report";
import type { DemandReport } from "../../../src/types/demand-report";

type AnalyzeRequestBody = {
  keyword?: string;
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as AnalyzeRequestBody;
    const keyword = typeof body.keyword === "string" ? body.keyword.trim() : "";

    const report: DemandReport = {
      ...mockDemandReport,
      keyword: keyword || mockDemandReport.keyword,
    };

    return Response.json(report, { status: 200 });
  } catch {
    return Response.json(
      { message: "Invalid request body. Expected JSON payload: { keyword: string }." },
      { status: 400 },
    );
  }
}
