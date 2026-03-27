import { Zap } from "lucide-react";

const ResultsLoading = ({ query }: { query: string }) => {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Skeleton header */}
      <header className="border-b border-border/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-5 h-5 rounded bg-muted animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Demand Radar</span>
          </div>
          <div className="flex-1 max-w-md ml-4 h-9 glass rounded-xl animate-pulse" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Title skeleton */}
        <div className="mb-10">
          <div className="h-4 w-32 bg-muted rounded-lg animate-pulse mb-3" />
          <div className="h-10 w-72 bg-muted rounded-xl animate-pulse" />
        </div>

        {/* Score cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`glass rounded-2xl p-6 ${i === 0 ? "ring-1 ring-primary/20 shadow-glow" : ""}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded bg-muted animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-9 w-20 bg-muted rounded-lg animate-pulse" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
                <div className="h-5 w-28 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted animate-pulse flex-shrink-0" />
                    <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass rounded-2xl p-6">
                <div className="h-4 w-full bg-muted rounded animate-pulse mb-4" />
                <div className="h-4 w-4/5 bg-muted rounded animate-pulse mb-6" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-2.5 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right column skeleton */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
              <div className="h-5 w-28 bg-muted rounded animate-pulse" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass rounded-2xl p-6">
                <div className="h-5 w-32 bg-muted rounded animate-pulse mb-3" />
                <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                  <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-full px-6 py-3 flex items-center gap-3 shadow-elevated animate-fade-in-up z-50">
        <div className="w-5 h-5 rounded-lg gradient-primary flex items-center justify-center animate-pulse">
          <Zap className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="text-sm text-foreground font-medium">Analyzing "{query}"</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsLoading;
