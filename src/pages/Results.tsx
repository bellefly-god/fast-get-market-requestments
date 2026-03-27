import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getMockData, type InsightData } from "@/data/mockData";
import { Zap, ArrowLeft, Search, TrendingUp, MessageSquare, Lightbulb, Target, BarChart3, ThumbsUp, ArrowUpRight } from "lucide-react";

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newQuery, setNewQuery] = useState(query);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setData(getMockData(query));
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuery.trim()) {
      navigate(`/results?q=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  const getDifficultyColor = (d: string) => {
    if (d === "Easy") return "text-green-400 bg-green-400/10";
    if (d === "Medium") return "text-yellow-400 bg-yellow-400/10";
    return "text-red-400 bg-red-400/10";
  };

  const getTrendColor = (label: string) => {
    if (label === "Rising") return "text-green-400";
    if (label === "Stable") return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Analyzing "{query}"</h2>
          <p className="text-muted-foreground">Scanning user feedback across platforms...</p>
          <div className="flex gap-1.5 justify-center mt-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full gradient-primary animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Demand Radar</span>
          </div>
          <form onSubmit={handleSearch} className="flex-1 max-w-md ml-4">
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-foreground text-sm flex-1 placeholder:text-muted-foreground"
                placeholder="Search another topic..."
              />
            </div>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8 animate-fade-in-up">
          <p className="text-sm text-muted-foreground mb-1">Analysis results for</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">{data.keyword}</h1>
        </div>

        {/* Score cards row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <ScoreCard
            icon={<Target className="w-5 h-5" />}
            label="Opportunity"
            value={data.opportunityScore.toFixed(1)}
            suffix="/10"
            accent
          />
          <ScoreCard
            icon={<BarChart3 className="w-5 h-5" />}
            label="Demand"
            value={data.demandScore.toFixed(1)}
            suffix="/10"
          />
          <ScoreCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Trend"
            value={data.trendScore.toString()}
            suffix={`/10`}
            extra={<span className={`text-xs font-medium ${getTrendColor(data.trendLabel)}`}>{data.trendLabel}</span>}
          />
          <ScoreCard
            icon={<ArrowUpRight className="w-5 h-5" />}
            label="Monetization"
            value={data.monetizationScore.toFixed(1)}
            suffix="/10"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column: Pain Points */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <section className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-accent-foreground" />
                </div>
                <h2 className="font-semibold text-foreground">Key Insights</h2>
              </div>
              <ul className="space-y-3">
                {data.summary.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-secondary-foreground">
                    <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </section>

            {/* Pain Point Quotes */}
            <section className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-accent-foreground" />
                </div>
                <h2 className="font-semibold text-foreground">Real User Pain Points</h2>
                <span className="text-xs text-muted-foreground ml-auto">{data.painPoints.length} quotes</span>
              </div>
              <div className="space-y-4">
                {data.painPoints.map((pp) => (
                  <div key={pp.id} className="glass rounded-2xl p-5 hover:shadow-glow transition-all duration-300 group">
                    <p className="text-sm text-foreground leading-relaxed mb-4">"{pp.quote}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {pp.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">@{pp.author}</p>
                          <p className="text-[10px] text-muted-foreground">{pp.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1 text-xs">
                          <ThumbsUp className="w-3 h-3" /> {pp.upvotes}
                        </span>
                        <span className="text-[10px]">{pp.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column: Product Ideas */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-accent-foreground" />
              </div>
              <h2 className="font-semibold text-foreground">Product Ideas</h2>
            </div>
            {data.productIdeas.map((idea) => (
              <div key={idea.id} className="glass rounded-2xl p-5 hover:shadow-glow transition-all duration-300 group">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-accent-foreground transition-colors">{idea.title}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getDifficultyColor(idea.difficulty)}`}>
                    {idea.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{idea.description}</p>
                <div className="flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{idea.targetUser}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

function ScoreCard({ icon, label, value, suffix, accent, extra }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix: string;
  accent?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className={`glass rounded-2xl p-5 ${accent ? "shadow-glow border-primary/20" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-extrabold ${accent ? "gradient-text" : "text-foreground"}`}>{value}</span>
        <span className="text-sm text-muted-foreground">{suffix}</span>
      </div>
      {extra && <div className="mt-1">{extra}</div>}
    </div>
  );
}

export default Results;
