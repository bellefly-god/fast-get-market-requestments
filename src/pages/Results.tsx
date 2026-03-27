import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getMockData, type InsightData } from "@/data/mockData";
import { Zap, ArrowLeft, Search, TrendingUp, MessageSquare, Lightbulb, Target, BarChart3, ThumbsUp, ArrowUpRight, DollarSign, Users, Rocket } from "lucide-react";
import ResultsLoading from "@/components/ResultsLoading";

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
    }, 2000);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuery.trim()) {
      navigate(`/results?q=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  const getDifficultyColor = (d: string) => {
    if (d === "Easy") return "text-green-400 bg-green-400/10 border-green-400/20";
    if (d === "Medium") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  const getTrendColor = (label: string) => {
    if (label === "Rising") return "text-green-400";
    if (label === "Stable") return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return <ResultsLoading query={query} />;
  }

  if (!data) return null;

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
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 hover:border-primary/30 transition-colors duration-200">
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

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-10 animate-fade-in-up">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">Analysis results for</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{data.keyword}</h1>
        </div>

        {/* Opportunity Score Hero */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:shadow-glow transition-all duration-500">
            {/* Background glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/15 transition-all duration-700" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-shrink-0">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Opportunity Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl md:text-8xl font-black gradient-text leading-none">{data.opportunityScore.toFixed(1)}</span>
                  <span className="text-2xl text-muted-foreground font-medium">/10</span>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-3 gap-6 w-full">
                <SubMetric icon={<BarChart3 className="w-4 h-4" />} label="Demand" value={data.demandScore.toFixed(1)} />
                <SubMetric icon={<Users className="w-4 h-4" />} label="Competition" value={data.competitionScore.toFixed(1)} />
                <SubMetric icon={<DollarSign className="w-4 h-4" />} label="Monetization" value={data.monetizationScore.toFixed(1)} />
              </div>
            </div>

            {/* Trend badge */}
            <div className="mt-6 flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${getTrendColor(data.trendLabel)}`} />
              <span className={`text-sm font-semibold ${getTrendColor(data.trendLabel)}`}>
                Trend: {data.trendLabel}
              </span>
              <span className="text-xs text-muted-foreground ml-1">({data.trendScore}/10)</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            <section className="glass rounded-2xl p-7 animate-fade-in-up hover:shadow-glow/50 transition-all duration-300" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                  <Lightbulb className="w-4.5 h-4.5 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-lg">Key Insights</h2>
                  <p className="text-xs text-muted-foreground">Top patterns from user feedback</p>
                </div>
              </div>
              <ul className="space-y-4">
                {data.summary.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-secondary-foreground group/item">
                    <span className="w-6 h-6 rounded-lg gradient-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold shadow-sm">
                      {i + 1}
                    </span>
                    <span className="group-hover/item:text-foreground transition-colors duration-200">{s}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Pain Point Quotes */}
            <section className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                  <MessageSquare className="w-4.5 h-4.5 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-foreground text-lg">Real User Pain Points</h2>
                  <p className="text-xs text-muted-foreground">Scraped from public forums & social media</p>
                </div>
                <span className="text-xs text-muted-foreground glass rounded-full px-3 py-1">{data.painPoints.length} quotes</span>
              </div>
              <div className="space-y-4">
                {data.painPoints.map((pp) => (
                  <div key={pp.id} className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group hover:-translate-y-0.5">
                    <p className="text-sm text-foreground leading-relaxed mb-5 italic">"{pp.quote}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shadow-sm">
                          {pp.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">@{pp.author}</p>
                          <p className="text-[11px] text-muted-foreground">{pp.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1.5 text-xs group-hover:text-accent-foreground transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5" /> {pp.upvotes}
                        </span>
                        <span className="text-[11px]">{pp.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column: Product Ideas */}
          <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                <Rocket className="w-4.5 h-4.5 text-accent-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg">Startup Ideas</h2>
                <p className="text-xs text-muted-foreground">Validated product opportunities</p>
              </div>
            </div>
            {data.productIdeas.map((idea, idx) => (
              <div key={idea.id} className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group hover:-translate-y-0.5 relative overflow-hidden">
                {/* Rank indicator */}
                <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-muted-foreground/40">#{idx + 1}</span>
                </div>

                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-foreground text-base group-hover:gradient-text transition-colors duration-200">{idea.title}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getDifficultyColor(idea.difficulty)}`}>
                    {idea.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{idea.description}</p>
                
                {/* Meta tags */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{idea.targetUser}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{idea.revenueModel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                    <p className="text-xs text-green-400 font-semibold">Est. MRR: {idea.estimatedMRR}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

function SubMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      </div>
      <span className="text-2xl md:text-3xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">/10</span>
    </div>
  );
}

export default Results;
