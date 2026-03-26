import hiitImg from "@/assets/exercise-hiit.jpg";
import strengthImg from "@/assets/exercise-strength.jpg";
import cardioImg from "@/assets/exercise-cardio.jpg";
import recoveryImg from "@/assets/exercise-recovery.jpg";

type ExerciseCategory = "hiit" | "strength" | "cardio" | "recovery";

const categoryImages: Record<ExerciseCategory, string> = {
  hiit: hiitImg,
  strength: strengthImg,
  cardio: cardioImg,
  recovery: recoveryImg,
};

const categoryLabels: Record<ExerciseCategory, string> = {
  hiit: "HIIT 高强度",
  strength: "力量训练",
  cardio: "有氧运动",
  recovery: "恢复拉伸",
};

const keywordMap: [string[], ExerciseCategory][] = [
  [["hiit", "burpee", "mountain climber", "high knee", "squat jump", "plank jack", "jump rope"], "hiit"],
  [["push-up", "pushup", "lunge", "dumbbell", "goblet", "glute bridge", "tricep", "step-up", "russian twist", "crunch", "row"], "strength"],
  [["walk", "jog", "run", "cycling", "brisk"], "cardio"],
  [["yoga", "stretch", "rest", "foam", "meditation", "breathing", "recovery"], "recovery"],
];

export function getExerciseCategory(exercise: string): ExerciseCategory {
  const lower = exercise.toLowerCase();
  for (const [keywords, category] of keywordMap) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return "strength";
}

export function getExerciseImage(exercise: string): string {
  return categoryImages[getExerciseCategory(exercise)];
}

export function getExerciseCategoryLabel(exercise: string): string {
  return categoryLabels[getExerciseCategory(exercise)];
}
