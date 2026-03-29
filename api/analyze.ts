import type { DemandReport } from "../src/types/demand-report";

type AnalyzeRequestBody = {
  keyword?: string;
};

type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

type HandlerRequest = {
  method?: string;
  body?: unknown;
};

type HandlerResponse = {
  status: (code: number) => {
    json: (payload: unknown) => void;
  };
};

const baseReport: Omit<DemandReport, "keyword"> = {
  trendScore: 8,
  trendLabel: "Rising",
  quotes: [
    {
      source: "Reddit",
      author: "u/example1",
      text: "Most tools are too generic and don't help me validate demand fast enough.",
    },
    {
      source: "X",
      author: "@creatordev",
      text: "I need a way to turn scattered complaints into product ideas.",
    },
  ],
  painPoints: [
    "很难快速验证一个方向是否真有需求",
    "跨平台信息分散，整理成本高",
    "用户抱怨很多，但很难转化成可执行产品方案",
  ],
  productIdeas: [
    {
      title: "Pain Point Radar",
      description: "自动聚合用户抱怨并生成产品机会清单。",
      targetUser: "独立开发者",
    },
    {
      title: "Trend-to-Product Mapper",
      description: "把趋势词自动映射成可落地的 SaaS / 插件 / App 点子。",
      targetUser: "创业者与产品经理",
    },
  ],
  opportunityScore: 8.5,
  metrics: {
    demand: 9,
    competition: 6,
    monetization: 8,
  },
};

function parseBody(rawBody: unknown): AnalyzeRequestBody | null {
  if (!rawBody) return {};
  if (typeof rawBody === "string") {
    try {
      return JSON.parse(rawBody) as AnalyzeRequestBody;
    } catch {
      return null;
    }
  }
  if (typeof rawBody === "object") {
    return rawBody as AnalyzeRequestBody;
  }
  return null;
}

function sendError(res: HandlerResponse, status: number, code: string, message: string) {
  const payload: ApiError = {
    error: {
      code,
      message,
    },
  };
  return res.status(status).json(payload);
}

export default function handler(req: HandlerRequest, res: HandlerResponse) {
  const method = req.method ?? "UNKNOWN";
  console.log("[api/analyze] incoming request", { method });

  if (method !== "POST") {
    console.warn("[api/analyze] method not allowed", { method });
    return sendError(res, 405, "METHOD_NOT_ALLOWED", "Only POST is supported.");
  }

  try {
    const body = parseBody(req.body);
    if (body === null) {
      console.warn("[api/analyze] invalid JSON body");
      return sendError(res, 400, "INVALID_JSON", "Request body must be valid JSON.");
    }

    if (body.keyword !== undefined && typeof body.keyword !== "string") {
      console.warn("[api/analyze] invalid keyword type", { keywordType: typeof body.keyword });
      return sendError(res, 400, "INVALID_KEYWORD", "`keyword` must be a string.");
    }

    const keyword = body.keyword?.trim() || "youtube automation";
    const report: DemandReport = {
      ...baseReport,
      keyword,
    };

    console.log("[api/analyze] success", { keyword });
    return res.status(200).json(report);
  } catch (error) {
    console.error("[api/analyze] unexpected error", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Unexpected server error.");
  }

}
