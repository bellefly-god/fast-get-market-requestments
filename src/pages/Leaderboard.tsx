import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DemandReport } from "@/types/demand-report";
import { ArrowLeft, BarChart3, Lightbulb, Rocket, TrendingUp, Zap } from "lucide-react";
import { batchFetchReports, LEADERBOARD_KEYWORDS } from "@/lib/leaderboard";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<DemandReport[]>([]);
  const [failedKeywords, setFailedKeywords] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const loadLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await batchFetchReports(LEADERBOARD_KEYWORDS, controller.signal);
        setReports(result.reports);
        setFailedKeywords(result.failedKeywords);

        if (result.reports.length === 0) {
          setError("All keyword analyses failed.");
        }
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setReports([]);
        setFailedKeywords([]);
        setError(loadError instanceof Error ? loadError.message : "Failed to load leaderboard.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadLeaderboard();

    return () => controller.abort();
  }, []);

  const getTrendColor = (label: string) => {
    if (label === "Rising") return "text-green-400";
    if (label === "Stable") return "text-yellow-400";
    return "text-red-400";
  };

  const averageOpportunityScore =
    reports.length > 0 ? (reports.reduce((sum, report) => sum + report.opportunityScore, 0) / reports.length).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
            <div className="w-5 h-5 rounded bg-muted animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Demand Radar</span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10">
          <div className="mb-8">
            <div className="h-4 w-40 bg-muted rounded-lg animate-pulse mb-3" />
            <div className="h-12 w-80 bg-muted rounded-xl animate-pulse" />
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[0, 1, 2].map((item) => (
              <div key={item} className="glass rounded-2xl p-6">
                <div className="h-4 w-24 bg-muted rounded animate-pulse mb-3" />
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>

          <div className="space-y-5">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="glass rounded-2xl p-6">
                <div className="h-6 w-40 bg-muted rounded animate-pulse mb-4" />
                <div className="grid lg:grid-cols-[180px_160px_1fr_1fr_180px] gap-4">
                  {[0, 1, 2, 3, 4].map((cell) => (
                    <div key={cell} className="h-20 bg-muted rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error && reports.length === 0) {
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
            <h2 className="font-bold text-foreground text-lg mb-2">Unable to load leaderboard</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </section>
        </main>
      </div>
    );
  }

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
        <div className="mb-8 animate-fade-in-up">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">Today&apos;s Opportunity Leaderboard</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Ranked by opportunity score</h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
            A fixed MVP keyword set analyzed with the current pipeline and sorted from highest to lowest opportunity score.
          </p>
        </div>

        <section className="grid md:grid-cols-3 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <SummaryCard label="Keywords Analyzed" value={String(reports.length)} />
          <SummaryCard label="Highest Opportunity" value={reports[0]?.keyword ?? "N/A"} />
          <SummaryCard label="Average Score" value={`${averageOpportunityScore}/10`} />
        </section>

        {failedKeywords.length > 0 && (
          <section className="glass rounded-2xl p-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
            <p className="text-sm text-muted-foreground">
              Skipped failed keywords: {failedKeywords.join(", ")}
            </p>
          </section>
        )}

        <section className="space-y-5">
          {reports.map((report, index) => (
            <article
              key={`${report.keyword}-${report.generatedAt}`}
              className="glass rounded-2xl p-6 animate-fade-in-up hover:shadow-glow transition-all duration-300"
              style={{ animationDelay: `${0.1 + index * 0.04}s` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                <div className="lg:w-[180px]">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">#{index + 1}</p>
                  <h2 className="font-bold text-foreground text-xl leading-tight">{report.keyword}</h2>
                </div>

                <div className="lg:w-[160px] glass rounded-2xl p-4 border border-border/40">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">Opportunity</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black gradient-text leading-none">{report.opportunityScore.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground pb-1">/10</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <TrendingUp className={`w-4 h-4 ${getTrendColor(report.trendLabel)}`} />
                    <span className={`text-sm font-semibold ${getTrendColor(report.trendLabel)}`}>{report.trendLabel}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Trend {report.trendScore.toFixed(1)}/10</p>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Top Pain Points</h3>
                  </div>
                  <ul className="space-y-2">
                    {report.painPoints.slice(0, 2).map((item, painPointIndex) => (
                      <li key={`${report.keyword}-pain-${painPointIndex}`} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Top Product Ideas</h3>
                  </div>
                  <div className="space-y-2">
                    {report.productIdeas.slice(0, 2).map((idea, ideaIndex) => (
                      <div key={`${report.keyword}-idea-${ideaIndex}`} className="text-sm">
                        <p className="text-foreground font-medium">{idea.title}</p>
                        <p className="text-muted-foreground">{idea.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:w-[180px]">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Sources</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {report.sources.map((source) => (
                      <span key={`${report.keyword}-${source.type}-${source.name}`} className="text-[11px] text-muted-foreground glass rounded-full px-3 py-1">
                        {source.name}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(`/results?q=${encodeURIComponent(report.keyword)}`)}
                    className="text-xs text-foreground/80 hover:text-foreground glass rounded-full px-3 py-1.5 transition-colors"
                  >
                    View Full Report
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">{label}</p>
      <p className="text-3xl font-black text-foreground">{value}</p>
    </div>
  );
}

export default Leaderboard;
