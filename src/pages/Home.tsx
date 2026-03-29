import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Zap, TrendingUp, Lightbulb, BarChart3 } from "lucide-react";
import { readRecentSearches, saveRecentSearch } from "@/lib/recentSearches";
import type { DemandReport } from "@/types/demand-report";
import { readSavedReports } from "@/lib/savedReports";

const features = [
  { icon: TrendingUp, title: "Pain Points", desc: "Real user complaints from Reddit, Twitter & forums" },
  { icon: Lightbulb, title: "Product Ideas", desc: "AI-generated opportunities with difficulty ratings" },
  { icon: BarChart3, title: "Opportunity Score", desc: "Demand, competition & monetization analysis" },
];

const Home = () => {
  const [keyword, setKeyword] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedReports, setSavedReports] = useState<DemandReport[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecentSearches(readRecentSearches());
    setSavedReports(readSavedReports());
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      const nextKeyword = keyword.trim();
      setRecentSearches(saveRecentSearch(nextKeyword));
      navigate(`/results?q=${encodeURIComponent(nextKeyword)}`);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Demand Radar</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-8 animate-fade-in-up">
            <Zap className="w-3.5 h-3.5 text-accent-foreground" />
            Discover what users are struggling with
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Find Product Ideas<br />
            <span className="gradient-text">From Real Pain Points</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Enter a keyword and instantly discover user frustrations, market gaps, and validated product opportunities.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="relative max-w-2xl mx-auto">
              <div className="glass rounded-2xl p-2 shadow-glow">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4">
                    <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Search problems like: youtube automation, job search, ai tools"
                      className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base py-3"
                    />
                  </div>
                  <button
                    type="submit"
                    className="gradient-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0 text-sm"
                  >
                    Discover Opportunities
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {["youtube automation", "ai writing tools", "job search", "personal finance", "fitness tracking"].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setKeyword(tag);
                  setRecentSearches(saveRecentSearch(tag));
                  navigate(`/results?q=${encodeURIComponent(tag)}`);
                }}
                className="text-xs text-muted-foreground hover:text-foreground glass rounded-full px-3 py-1.5 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {recentSearches.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
              {recentSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setKeyword(item);
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
            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Saved Reports</p>
              <div className="flex flex-wrap justify-center gap-2">
                {savedReports.map((report) => (
                  <button
                    key={`${report.keyword}-${report.generatedAt}`}
                    onClick={() => navigate(`/results?q=${encodeURIComponent(report.keyword)}&saved=1`)}
                    className="text-xs text-foreground/80 hover:text-foreground glass rounded-full px-3 py-1.5 transition-colors"
                  >
                    {report.keyword}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Features */}
      <section className="px-6 pb-20 pt-16 max-w-4xl mx-auto w-full animate-fade-in-up" style={{ animationDelay: "0.55s" }}>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
