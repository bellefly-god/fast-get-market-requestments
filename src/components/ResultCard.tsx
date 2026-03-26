import { Apple, Dumbbell } from "lucide-react";
import { getExerciseImage, getExerciseCategoryLabel } from "@/lib/exerciseImages";

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
          <ul className="space-y-3">
            {plan.workout.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <img
                  src={getExerciseImage(item)}
                  alt={getExerciseCategoryLabel(item)}
                  loading="lazy"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-accent"
                />
                <div>
                  <span className="text-[10px] font-medium text-accent-foreground bg-accent px-1.5 py-0.5 rounded-md">
                    {getExerciseCategoryLabel(item)}
                  </span>
                  <p className="text-sm text-muted-foreground mt-0.5">{item}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
