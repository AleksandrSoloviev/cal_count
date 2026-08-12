import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import type { Goals } from "../domain/types";
import { validateGoals } from "../domain/validation";
import en from "../i18n/en";
import GoalInput from "../components/GoalInput";

type Props = { onComplete: (g: Goals) => void };

const OnboardingScreen = ({ onComplete }: Props) => {
  const [vals, setVals] = useState({ calories: "", protein: "", fat: "", carbs: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Goals, string>>>({});

  const set = (k: keyof typeof vals) => (v: string) => setVals((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = () => {
    const result = validateGoals(vals);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    onComplete(result.goals);
  };

  const allFilled =
    vals.calories && vals.protein !== "" && vals.fat !== "" && vals.carbs !== "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-16 max-w-sm mx-auto w-full">
        <div className="mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-6">
            <UtensilsCrossed size={18} className="text-primary-foreground" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2 leading-tight">
            {en.onboarding.title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{en.onboarding.subtitle}</p>
        </div>

        <div className="space-y-4">
          <GoalInput
            label={en.goals.calories}
            unit={en.goals.unitKcal}
            value={vals.calories}
            onChange={set("calories")}
            error={errors.calories}
            step="1"
            min={500}
            max={10000}
            hint="e.g. 2000"
          />
          <GoalInput
            label={en.goals.protein}
            unit={en.goals.unitG}
            value={vals.protein}
            onChange={set("protein")}
            error={errors.protein}
            step="0.1"
            min={0}
            max={1000}
            hint="e.g. 150"
          />
          <GoalInput
            label={en.goals.fat}
            unit={en.goals.unitG}
            value={vals.fat}
            onChange={set("fat")}
            error={errors.fat}
            step="0.1"
            min={0}
            max={1000}
            hint="e.g. 65"
          />
          <GoalInput
            label={en.goals.carbs}
            unit={en.goals.unitG}
            value={vals.carbs}
            onChange={set("carbs")}
            error={errors.carbs}
            step="0.1"
            min={0}
            max={1000}
            hint="e.g. 250"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allFilled}
          className="mt-8 w-full bg-primary text-primary-foreground rounded-xl py-4 text-sm font-semibold tracking-wide disabled:opacity-25 active:scale-[0.98] min-h-11"
        >
          {en.onboarding.cta}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
