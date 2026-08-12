import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { Goals } from "../domain/types";
import { validateGoals } from "../domain/validation";
import en from "../i18n/en";
import GoalInput from "../components/GoalInput";

type Props = {
  goals: Goals;
  onSave: (g: Goals) => void;
  onCancel: () => void;
};

const SettingsScreen = ({ goals, onSave, onCancel }: Props) => {
  const [vals, setVals] = useState({
    calories: String(goals.calories),
    protein: String(goals.protein),
    fat: String(goals.fat),
    carbs: String(goals.carbs),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Goals, string>>>({});

  const set = (k: keyof typeof vals) => (v: string) => setVals((prev) => ({ ...prev, [k]: v }));

  const handleSave = () => {
    const result = validateGoals(vals);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    onSave(result.goals);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-md mx-auto px-4 pt-12 pb-10">
        <div className="flex items-center gap-2 mb-8">
          <button
            type="button"
            onClick={onCancel}
            aria-label={en.settings.backAria}
            className="p-2 rounded-xl min-h-11 min-w-11 text-muted-foreground"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <h1 className="text-xl font-semibold tracking-tight">{en.settings.title}</h1>
        </div>

        <section className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">
            {en.settings.goals}
          </h2>
          <div className="space-y-4">
            <GoalInput label={en.goals.calories} unit={en.goals.unitKcal} value={vals.calories} onChange={set("calories")} error={errors.calories} step="1" min={500} max={10000} hint="e.g. 2000" />
            <GoalInput label={en.goals.protein} unit={en.goals.unitG} value={vals.protein} onChange={set("protein")} error={errors.protein} step="0.1" min={0} max={1000} hint="e.g. 150" />
            <GoalInput label={en.goals.fat} unit={en.goals.unitG} value={vals.fat} onChange={set("fat")} error={errors.fat} step="0.1" min={0} max={1000} hint="e.g. 65" />
            <GoalInput label={en.goals.carbs} unit={en.goals.unitG} value={vals.carbs} onChange={set("carbs")} error={errors.carbs} step="0.1" min={0} max={1000} hint="e.g. 250" />
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-dashed border-border p-5">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
            {en.settings.future}
          </h2>
          <p className="text-sm text-muted-foreground">{en.settings.futureHint}</p>
        </section>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border py-4 text-sm font-semibold min-h-11"
          >
            {en.settings.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl bg-primary text-primary-foreground py-4 text-sm font-semibold min-h-11"
          >
            {en.settings.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
