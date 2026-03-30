import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { DemandReport } from "@/types/demand-report";
import { Zap, ArrowLeft, Search, TrendingUp, MessageSquare, Lightbulb, Target, BarChart3, DollarSign, Users, Rocket, Copy, X } from "lucide-react";
import ResultsLoading from "@/components/ResultsLoading";
import { readRecentSearches, saveRecentSearch } from "@/lib/recentSearches";
import { useToast } from "@/hooks/use-toast";
import { deleteSavedReport, getSavedReport, readSavedReports, saveReport } from "@/lib/savedReports";

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const query = searchParams.get("q") || "";
  const compareQuery = searchParams.get("q2") || "";
  const isCompareMode = compareQuery.trim().length > 0;
  const savedMode = searchParams.get("saved") === "1";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DemandReport | null>(null);
  const [comparisonReport, setComparisonReport] = useState<DemandReport | null>(null);
  const [newQuery, setNewQuery] = useState(query);
  const [newCompareQuery, setNewCompareQuery] = useState(compareQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedReports, setSavedReports] = useState<DemandReport[]>([]);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
    setSavedReports(readSavedReports());
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReport = async () => {
      setComparisonReport(null);

      const savedReport = savedMode ? getSavedReport(query) : null;

      if (!isCompareMode && savedReport) {
        setReport(savedReport);
        setRecentSearches(saveRecentSearch(savedReport.keyword));
        setSavedReports(readSavedReports());
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const analyzeKeyword = async (keyword: string) => {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ keyword }),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Analyze request failed: ${response.status}`);
          }

          return (await response.json()) as DemandReport;
        };

        if (isCompareMode) {
          const [primaryData, secondaryData] = await Promise.all([analyzeKeyword(query), analyzeKeyword(compareQuery)]);
          setReport(primaryData);
          setComparisonReport(secondaryData);
          setRecentSearches(saveRecentSearch(primaryData.keyword));
          setSavedReports(saveReport(primaryData));
          saveReport(secondaryData);
          setSavedReports(readSavedReports());
        } else {
          const data = await analyzeKeyword(query);
          setReport(data);
          setRecentSearches(saveRecentSearch(data.keyword));
          setSavedReports(saveReport(data));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setReport(null);
        setComparisonReport(null);
        setError(err instanceof Error ? err.message : "Failed to load analysis results.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchReport();

    return () => controller.abort();
  }, [query, compareQuery, isCompareMode, savedMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuery.trim()) {
      const nextKeyword = newQuery.trim();
      setRecentSearches(saveRecentSearch(nextKeyword));
      if (newCompareQuery.trim()) {
        navigate(`/results?q=${encodeURIComponent(nextKeyword)}&q2=${encodeURIComponent(newCompareQuery.trim())}`);
        return;
      }
      navigate(`/results?q=${encodeURIComponent(nextKeyword)}`);
    }
  };

  const getTrendColor = (label: string) => {
    if (label === "Rising") return "text-green-400";
    if (label === "Stable") return "text-yellow-400";
    return "text-red-400";
  };

  const generatedAtLabel = (() => {
    const parsed = new Date(report?.generatedAt ?? "");
    return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleString();
  })();

  if (loading) {
    return <ResultsLoading query={query} />;
  }

  if (error || !report) {
    return (
      <div className="min-h-screen gradient-bg">
        <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors hover:-translate-x-0.5 duration-200">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Demand Radar</span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10">
          <section className="glass rounded-2xl p-7 animate-fade-in-up">
            <h2 className="font-bold text-foreground text-lg mb-2">Unable to load results</h2>
            <p className="text-sm text-muted-foreground">{error ?? "No report data returned."}</p>
          </section>
        </main>
      </div>
    );
  }

  const painPointsExport = report.painPoints.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const productIdeasExport = report.productIdeas
    .map((idea, index) => `${index + 1}. ${idea.title}\nDescription: ${idea.description}\nTarget User: ${idea.targetUser}`)
    .join("\n\n");
  const fullReportExport = [
    `Keyword: ${report.keyword}`,
    `Opportunity Score: ${report.opportunityScore.toFixed(1)}/10`,
    `Trend: ${report.trendLabel} (${report.trendScore.toFixed(1)}/10)`,
    "",
    "Pain Points:",
    painPointsExport,
    "",
    "Product Ideas:",
    productIdeasExport,
    "",
    "Quotes:",
    report.quotes.map((quote, index) => `${index + 1}. "${quote.text}"${quote.author ? ` — ${quote.author}` : ""} (${quote.source})`).join("\n"),
    "",
    "Sources:",
    report.sources.map((source) => `- ${source.name} [${source.type}]`).join("\n"),
    generatedAtLabel ? `Generated At: ${generatedAtLabel}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const copyToClipboard = async (label: string, value: string) => {
    if (!value.trim()) {
      toast({
        title: `No ${label.toLowerCase()} available`,
        description: "There was nothing to copy from this report.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: `${label} copied`,
        description: "The content is now in your clipboard.",
      });
    } catch (copyError) {
      console.error("[Results] copy failed", copyError);
      toast({
        title: `Failed to copy ${label.toLowerCase()}`,
        description: "Clipboard access was unavailable in this browser.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSavedReport = (keywordToDelete: string) => {
    const next = deleteSavedReport(keywordToDelete);
    setSavedReports(next);

    if (report.keyword.trim().toLowerCase() === keywordToDelete.trim().toLowerCase() && savedMode) {
      navigate("/");
    }
  };

  const buildComparisonSummary = (primary: DemandReport, secondary: DemandReport): string => {
    const primaryStrength =
      primary.opportunityScore * 0.5 +
      primary.trendScore * 0.3 +
      primary.metrics.competition * 0.2;
    const secondaryStrength =
      secondary.opportunityScore * 0.5 +
      secondary.trendScore * 0.3 +
      secondary.metrics.competition * 0.2;

    const winner = primaryStrength >= secondaryStrength ? primary : secondary;
    const loser = winner.keyword === primary.keyword ? secondary : primary;
    const demandGap = Math.abs(primary.opportunityScore - secondary.opportunityScore).toFixed(1);

    return `${winner.keyword} looks more promising for an indie developer right now because it pairs a stronger opportunity score with a ${winner.trendLabel.toLowerCase()} trend signal. Compared with ${loser.keyword}, it currently shows a clearer path to a focused product and a smaller execution tradeoff, with an overall edge of about ${demandGap} points on opportunity score.`;
  };

  const getMetricExplanation = (metric: "demand" | "competition" | "monetization"): string => {
    if (metric === "demand") {
      if (report.metrics.demand >= 8) {
        return `Demand scores high because the report surfaces repeated pain points and a ${report.trendLabel.toLowerCase()} trend signal around ${report.keyword}.`;
      }

      if (report.metrics.demand >= 6) {
        return `Demand is moderate because ${report.keyword} shows clear user needs, but the overall trend signal is not overwhelmingly strong yet.`;
      }

      return `Demand is lower because the current synthesis shows fewer strong recurring signals around ${report.keyword}.`;
    }

    if (metric === "competition") {
      if (report.metrics.competition >= 8) {
        return `Competition scores high here because the synthesis suggests a crowded market with many existing angles on ${report.keyword}.`;
      }

      if (report.metrics.competition >= 6) {
        return `Competition looks moderate because there is room to differentiate, but the space is active enough that positioning still matters.`;
      }

      return `Competition is relatively low because the current pain points suggest underserved needs that still leave space for a focused indie product.`;
    }

    if (report.metrics.monetization >= 8) {
      return `Monetization scores high because the product ideas point to practical workflows that teams or creators are likely to pay to improve.`;
    }

    if (report.metrics.monetization >= 6) {
      return `Monetization is decent because ${report.keyword} appears commercially useful, though the clearest paid wedge is still somewhat narrow.`;
    }

    return `Monetization is weaker because the current synthesis shows less direct evidence of urgent, budget-backed buying intent.`;
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors hover:-translate-x-0.5 duration-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Demand Radar</span>
          </div>
          <form onSubmit={handleSearch} className="flex-1 max-w-md ml-4">
            <div className={`glass rounded-xl px-3 py-1.5 hover:border-primary/30 transition-colors duration-200 ${isCompareMode ? "grid md:grid-cols-2 gap-2" : "flex items-center gap-2"}`}>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-foreground text-sm flex-1 placeholder:text-muted-foreground"
                  placeholder={isCompareMode ? "First keyword..." : "Search another topic..."}
                />
              </div>
              {isCompareMode && (
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    value={newCompareQuery}
                    onChange={(e) => setNewCompareQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-foreground text-sm flex-1 placeholder:text-muted-foreground"
                    placeholder="Second keyword..."
                  />
                </div>
              )}
            </div>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {isCompareMode && report && comparisonReport ? (
          <>
            <div className="mb-10 animate-fade-in-up">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">Comparison results</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                {report.keyword} vs {comparisonReport.keyword}
              </h1>
              <p className="text-sm text-muted-foreground mt-3 max-w-3xl">
                {buildComparisonSummary(report, comparisonReport)}
              </p>
            </div>

            <section className="grid lg:grid-cols-2 gap-8">
              <CompareColumn report={report} getTrendColor={getTrendColor} />
              <CompareColumn report={comparisonReport} getTrendColor={getTrendColor} />
            </section>
          </>
        ) : (
          <>
        {/* Title */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">Analysis results for</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{report.keyword}</h1>
            </div>
            <button
              onClick={() => void copyToClipboard("Full report", fullReportExport)}
              className="inline-flex items-center gap-2 self-start text-xs text-foreground/80 hover:text-foreground glass rounded-full px-4 py-2 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Full Report
            </button>
          </div>
          {recentSearches.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {recentSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setNewQuery(item);
                    navigate(`/results?q=${encodeURIComponent(item)}`);
                  }}
                  className="text-xs text-foreground/80 hover:text-foreground glass rounded-full px-3 py-1.5 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          {savedReports.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">Saved Reports</p>
              <div className="flex flex-wrap gap-2">
                {savedReports.map((savedReport) => (
                  <div key={`${savedReport.keyword}-${savedReport.generatedAt}`} className="flex items-center glass rounded-full overflow-hidden">
                    <button
                      onClick={() => {
                        setNewQuery(savedReport.keyword);
                        navigate(`/results?q=${encodeURIComponent(savedReport.keyword)}&saved=1`);
                      }}
                      className="text-xs text-foreground/80 hover:text-foreground px-3 py-1.5 transition-colors"
                    >
                      {savedReport.keyword}
                    </button>
                    <button
                      onClick={() => handleDeleteSavedReport(savedReport.keyword)}
                      aria-label={`Delete saved report for ${savedReport.keyword}`}
                      className="px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors border-l border-border/50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Opportunity Score Hero */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:shadow-glow transition-all duration-500">
            {/* Background glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/15 transition-all duration-700" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="relative space-y-7">
              <div className="flex flex-col lg:flex-row lg:items-end gap-8">
                <div className="flex-shrink-0">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground mb-3 font-medium">Opportunity Score</p>
                  <div className="flex items-end gap-3">
                    <span className="text-8xl md:text-9xl font-black gradient-text leading-none">{report.opportunityScore.toFixed(1)}</span>
                    <span className="text-2xl text-muted-foreground font-medium pb-3">/10</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 max-w-sm">
                    Composite score based on demand, competition, and monetization potential.
                  </p>
                </div>

                <div className="lg:ml-auto min-w-[220px] glass rounded-2xl px-5 py-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className={`w-4 h-4 ${getTrendColor(report.trendLabel)}`} />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Trend Signal</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-foreground leading-none">{report.trendScore.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground pb-1">/10</span>
                  </div>
                  <p className={`text-sm font-semibold mt-2 ${getTrendColor(report.trendLabel)}`}>
                    {report.trendLabel}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <SubMetric icon={<BarChart3 className="w-4 h-4" />} label="Demand" value={report.metrics.demand.toFixed(1)} description={getMetricExplanation("demand")} />
                <SubMetric icon={<Users className="w-4 h-4" />} label="Competition" value={report.metrics.competition.toFixed(1)} description={getMetricExplanation("competition")} />
                <SubMetric icon={<DollarSign className="w-4 h-4" />} label="Monetization" value={report.metrics.monetization.toFixed(1)} description={getMetricExplanation("monetization")} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pain Points */}
            <section className="glass rounded-2xl p-7 animate-fade-in-up hover:shadow-glow/50 transition-all duration-300" style={{ animationDelay: "0.2s" }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                    <Lightbulb className="w-4.5 h-4.5 text-accent-foreground" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-lg">Pain Points</h2>
                    <p className="text-xs text-muted-foreground">Top patterns from user feedback</p>
                  </div>
                </div>
                <button
                  onClick={() => void copyToClipboard("Pain points", painPointsExport)}
                  className="inline-flex items-center gap-2 text-xs text-foreground/80 hover:text-foreground glass rounded-full px-3 py-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>
              <ul className="space-y-4">
                {report.painPoints.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-secondary-foreground group/item">
                    <span className="w-6 h-6 rounded-lg gradient-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold shadow-sm">
                      {i + 1}
                    </span>
                    <span className="group-hover/item:text-foreground transition-colors duration-200">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right column: Product Ideas */}
          <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                  <Rocket className="w-4.5 h-4.5 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-lg">Startup Ideas</h2>
                  <p className="text-xs text-muted-foreground">Validated product opportunities</p>
                </div>
              </div>
              <button
                onClick={() => void copyToClipboard("Product ideas", productIdeasExport)}
                className="inline-flex items-center gap-2 text-xs text-foreground/80 hover:text-foreground glass rounded-full px-3 py-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
            </div>
            {report.productIdeas.map((idea, idx) => (
              <div key={idea.title} className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group hover:-translate-y-0.5 relative overflow-hidden">
                {/* Rank indicator */}
                <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-muted-foreground/40">#{idx + 1}</span>
                </div>

                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-foreground text-base group-hover:gradient-text transition-colors duration-200">{idea.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{idea.description}</p>
                
                {/* Meta tags */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{idea.targetUser}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-10 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <MessageSquare className="w-4.5 h-4.5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-foreground text-lg">Quotes</h2>
              <p className="text-xs text-muted-foreground">Representative user language from the source set</p>
            </div>
            <span className="text-xs text-muted-foreground glass rounded-full px-3 py-1">{report.quotes.length} quotes</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {report.quotes.map((quote, index) => (
              <article key={`${quote.source}-${quote.author ?? "unknown"}-${index}`} className="glass rounded-2xl p-5 text-sm text-foreground">
                <p className="leading-relaxed">"{quote.text}"</p>
                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{quote.author ? `${quote.author} via ${quote.source}` : quote.source}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 glass rounded-2xl p-7 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Sources & Timing</h2>
              <p className="text-xs text-muted-foreground">Report provenance and generation timestamp</p>
            </div>
          </div>
          <div className="space-y-4">
            {generatedAtLabel && (
              <p className="text-sm text-muted-foreground">
                Generated {generatedAtLabel}
              </p>
            )}
            {report.sources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {report.sources.map((source) => (
                  <span
                    key={`${source.type}-${source.name}`}
                    className="text-[11px] text-muted-foreground glass rounded-full px-3 py-1"
                  >
                    {source.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
};

function CompareColumn({
  report,
  getTrendColor,
}: {
  report: DemandReport;
  getTrendColor: (label: string) => string;
}) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <section className="glass rounded-3xl p-7 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">{report.keyword}</p>
          <div className="flex items-end gap-3 mb-5">
            <span className="text-6xl md:text-7xl font-black gradient-text leading-none">{report.opportunityScore.toFixed(1)}</span>
            <span className="text-xl text-muted-foreground pb-2">/10</span>
          </div>
          <div className="glass rounded-2xl px-4 py-4 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className={`w-4 h-4 ${getTrendColor(report.trendLabel)}`} />
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Trend Signal</p>
            </div>
            <p className="text-3xl font-black text-foreground">{report.trendScore.toFixed(1)}<span className="text-sm text-muted-foreground ml-1">/10</span></p>
            <p className={`text-sm font-semibold mt-1 ${getTrendColor(report.trendLabel)}`}>{report.trendLabel}</p>
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-bold text-foreground text-lg mb-4">Top Pain Points</h2>
        <ul className="space-y-3">
          {report.painPoints.slice(0, 4).map((item, index) => (
            <li key={`${report.keyword}-pain-${index}`} className="flex items-start gap-3 text-sm text-secondary-foreground">
              <span className="w-6 h-6 rounded-lg gradient-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold shadow-sm">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-bold text-foreground text-lg mb-4">Product Ideas</h2>
        <div className="space-y-3">
          {report.productIdeas.slice(0, 3).map((idea, index) => (
            <div key={`${report.keyword}-idea-${index}`} className="glass rounded-2xl p-4">
              <h3 className="font-semibold text-foreground text-sm">{idea.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{idea.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Target className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{idea.targetUser}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SubMetric({ icon, label, value, description }: { icon: React.ReactNode; label: string; value: string; description: string }) {
  return (
    <div className="glass rounded-2xl p-4 text-center border border-border/40">
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      </div>
      <div>
        <span className="text-2xl md:text-3xl font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">/10</span>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{description}</p>
    </div>
  );
}

export default Results;
