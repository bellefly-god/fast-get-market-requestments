import { useState, useRef } from "react";
import HeroSection from "@/components/HeroSection";
import InputForm from "@/components/InputForm";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ResultCard from "@/components/ResultCard";
import WeeklyPlan from "@/components/WeeklyPlan";
import FooterCta from "@/components/FooterCta";
import { samplePlans } from "@/data/samplePlans";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(true); // show example by default
  const [plans, setPlans] = useState(samplePlans);
  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setShowResults(false);

    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
      setPlans(samplePlans);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 2000);
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-3xl mx-auto">
        <HeroSection onCtaClick={scrollToForm} />

        <div ref={formRef}>
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {isLoading && <LoadingSkeleton />}

        {showResults && !isLoading && (
          <div ref={resultsRef} className="px-6 pb-8 opacity-0 animate-fade-in-up-delay-2">
            <div className="max-w-2xl mx-auto">
              <ResultCard plan={plans[0]} highlighted />
            </div>
          </div>
        )}

        {showResults && !isLoading && (
          <div className="opacity-0 animate-fade-in-up-delay-3">
            <WeeklyPlan plans={plans.slice(1)} />
          </div>
        )}

        <FooterCta />
      </div>
    </div>
  );
};

export default Index;
