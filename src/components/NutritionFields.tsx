import { useId, type ChangeEvent } from "react";
import { calorieEstimateKcal } from "../domain/nutrition";
import type { Nutrient } from "../domain/types";
import en from "../i18n/en";

type Props = {
  value: Nutrient;
  onChange: (v: Nutrient) => void;
  label?: string;
};

const NutritionFields = ({ value, onChange, label }: Props) => {
  const fieldId = useId();
  const hintId = `${fieldId}-est`;
  const hintKcal = calorieEstimateKcal(value.calories, value.protein, value.fat, value.carbs);

  const handleChange = (k: keyof Nutrient) => (event: ChangeEvent<HTMLInputElement>) => {
    const n = parseFloat(event.target.value);
    onChange({ ...value, [k]: Number.isNaN(n) ? 0 : n });
  };

  const fields = [
    { key: "calories" as const, label: en.nutrient.calories, unit: "kcal", step: "1" },
    { key: "protein" as const, label: en.nutrient.protein, unit: "g", step: "0.1" },
    { key: "fat" as const, label: en.nutrient.fat, unit: "g", step: "0.1" },
    { key: "carbs" as const, label: en.nutrient.carbs, unit: "g", step: "0.1" },
  ];

  return (
    <div>
      {label && (
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
          {label}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {fields.map((f) => {
          const isCalories = f.key === "calories";
          const describedBy = isCalories && hintKcal != null ? hintId : undefined;
          return (
            <div
              key={f.key}
              className="flex flex-col rounded-lg border border-border bg-card px-3 py-2.5 focus-within:border-foreground/40"
            >
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{f.label}</p>
                  <input
                    type="number"
                    inputMode="decimal"
                    step={f.step}
                    min={0}
                    defaultValue={value[f.key] || ""}
                    onChange={handleChange(f.key)}
                    placeholder="0"
                    aria-label={f.label}
                    aria-describedby={describedBy}
                    className="w-full bg-transparent outline-none font-mono text-base text-foreground placeholder:text-muted-foreground/30 min-h-11"
                  />
                </div>
                <span className="text-xs text-muted-foreground ml-1">{f.unit}</span>
              </div>
              {isCalories && hintKcal != null && (
                <p id={hintId} className="text-xs text-muted-foreground mt-1">
                  {en.addFood.estKcal(hintKcal)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NutritionFields;
