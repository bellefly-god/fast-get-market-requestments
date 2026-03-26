import { Apple, Dumbbell } from "lucide-react";

export interface DayPlan {
  day: string;
  diet: string[];
  workout: string[];
}

interface ResultCardProps {
  plan: DayPlan;
  highlighted?: boolean;
}

const ResultCard = ({ plan, highlighted = false }: ResultCardProps) => {
  return (
    <div
      className={`rounded-3xl p-6 md:p-8 transition-all ${
        highlighted
          ? "bg-card shadow-elevated border-2 border-primary/10"
          : "bg-card shadow-card"
      }`}
    >
      {highlighted && (
        <p className="text-xs font-semibold text-accent-foreground bg-accent inline-block px-3 py-1 rounded-full mb-4">
          Today's Plan
        </p>
      )}
      <p className="font-semibold text-foreground mb-5">{plan.day}</p>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
              <Apple className="w-4 h-4 text-accent-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">What to Eat</h3>
          </div>
          <ul className="space-y-2">
            {plan.diet.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-accent-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">What to Do</h3>
          </div>
          <ul className="space-y-2">
            {plan.workout.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
