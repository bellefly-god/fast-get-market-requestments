import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  onCtaClick: () => void;
}

const HeroSection = ({ onCtaClick }: HeroSectionProps) => {
  return (
    <section className="text-center pt-20 pb-10 px-6 opacity-0 animate-fade-in-up">
      <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
        <Sparkles className="w-4 h-4" />
        AI-Powered Fitness
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4 leading-tight">
        AI Fat Loss Coach
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto mb-4">
        Get your personalized workout and diet plan in 30 seconds
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        No login required • Free to start
      </p>
      <button
        onClick={onCtaClick}
        className="bg-primary text-primary-foreground rounded-2xl shadow-elevated hover:shadow-card-hover hover:-translate-y-1 active:translate-y-0 text-base font-semibold h-14 px-10 transition-all duration-200 inline-flex items-center gap-2"
      >
        Generate My Plan
      </button>
    </section>
  );
};

export default HeroSection;
