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

function parseBody(rawBody: unknown): AnalyzeRequestBody | null {
  if (!rawBody) return {};
  if (typeof rawBody === "string") {
    try {
      return JSON.parse(rawBody) as AnalyzeRequestBody;
    } catch (error) {
      console.error("[api/analyze] parseBody failed", error);
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
  console.log("[api/analyze] handler start", { method });

  try {
    if (method !== "POST") {
      console.warn("[api/analyze] method not allowed", { method });
      return sendError(res, 405, "METHOD_NOT_ALLOWED", "Only POST is supported.");
    }

    const body = parseBody(req.body);
    if (body === null) {
      console.error("[api/analyze] invalid JSON body");
      return sendError(res, 400, "INVALID_JSON", "Request body must be valid JSON.");
    }

    console.log("[api/analyze] request parsed", {
      method,
      hasKeyword: typeof body.keyword === "string" && body.keyword.trim().length > 0,
    });

    if (body.keyword !== undefined && typeof body.keyword !== "string") {
      console.error("[api/analyze] invalid keyword type", { keywordType: typeof body.keyword });
      return sendError(res, 400, "INVALID_KEYWORD", "`keyword` must be a string.");
    }

    return import("../lib/analyze")
      .then(({ analyzeKeyword }) => {
        const report = analyzeKeyword(body.keyword ?? "");

        console.log("[api/analyze] success", { keyword: report.keyword });
        return res.status(200).json(report);
      })
      .catch((error) => {
        console.error("[api/analyze] failed to load analyzeKeyword", error);
        return sendError(res, 500, "INTERNAL_ERROR", "Unexpected server error.");
      });
  } catch (error) {
    console.error("[api/analyze] unexpected error", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Unexpected server error.");
  } finally {
    console.log("[api/analyze] handler finish", { method });
  }
}
