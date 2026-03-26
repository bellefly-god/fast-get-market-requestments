const LoadingSkeleton = () => {
  return (
    <section className="px-6 pb-8">
      <div className="max-w-2xl mx-auto bg-card rounded-3xl p-8 shadow-card space-y-6">
        <div className="text-center mb-4">
          <p className="text-muted-foreground animate-pulse-soft font-medium">
            AI is generating your plan...
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-5 w-28 bg-muted rounded-xl animate-pulse-soft" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded-lg animate-pulse-soft" />
                <div className="h-4 w-5/6 bg-muted rounded-lg animate-pulse-soft" />
                <div className="h-4 w-4/6 bg-muted rounded-lg animate-pulse-soft" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoadingSkeleton;
