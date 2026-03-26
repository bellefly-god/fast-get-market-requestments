import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ResultCard, { type DayPlan } from "./ResultCard";

interface WeeklyPlanProps {
  plans: DayPlan[];
}

const WeeklyPlan = ({ plans }: WeeklyPlanProps) => {
  const [open, setOpen] = useState(false);

  return (
    <section className="px-6 pb-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between bg-card rounded-2xl px-6 py-4 shadow-card hover:shadow-card-hover transition-all text-foreground font-semibold"
        >
          <span>📅 Full Weekly Plan</span>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        {open && (
          <div className="mt-4 space-y-4 opacity-0 animate-fade-in-up">
            {plans.map((plan, i) => (
              <ResultCard key={i} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WeeklyPlan;
