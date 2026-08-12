import { X } from "lucide-react";
import { fmtDate, fmtTime } from "../../domain/dates";
import { NUTRIENT_META, sumNutrition } from "../../domain/nutrition";
import type { Entry, Food, Goals } from "../../domain/types";
import en from "../../i18n/en";
import NutrientBar from "../NutrientBar";

type Props = {
  date: string;
  entries: Entry[];
  foods: Food[];
  goals: Goals;
  onClose: () => void;
};

const describeQty = (e: Entry, foods: Food[]): string => {
  if (e.method === "custom" && e.compQty) {
    const food = foods.find((f) => f.id === e.foodId);
    if (food?.components) {
      return food.components
        .filter((c) => (e.compQty?.[c.id] ?? 0) > 0)
        .map((c) => `${e.compQty?.[c.id]} ${c.name.toLowerCase()}`)
        .join(", ");
    }
  }
  if (e.qty !== undefined) {
    const unit = e.method === "grams" ? "g" : e.method === "milliliters" ? "ml" : " pcs";
    return `${e.qty}${unit}`;
  }
  return "";
};

const DayDetailSheet = ({ date, entries, foods, goals, onClose }: Props) => {
  const totals = sumNutrition(entries);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={fmtDate(date)}>
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" aria-label={en.dayDetail.closeAria} onClick={onClose} />
      <div className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{fmtDate(date)}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{en.history.items(entries.length)}</p>
            </div>
            <button type="button" onClick={onClose} aria-label={en.dayDetail.closeAria} className="p-2 min-h-11 min-w-11 text-muted-foreground">
              <X size={18} aria-hidden />
            </button>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border mb-6 space-y-4">
            {NUTRIENT_META.map((m) => (
              <NutrientBar
                key={m.key}
                label={m.label}
                unit={m.unit}
                color={m.color}
                current={totals[m.key]}
                goal={goals[m.key]}
              />
            ))}
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">{en.dayDetail.empty}</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border px-4">
              {entries.map((e) => (
                <div key={e.id} className="flex items-start gap-3 py-3.5 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium truncate">{e.foodName}</span>
                      <span className="text-xs text-muted-foreground">{describeQty(e, foods)}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{fmtTime(e.ts)}</span>
                  </div>
                  <span className="font-mono text-xs font-medium flex-shrink-0">
                    {Math.round(e.nutrition.calories)} kcal
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayDetailSheet;
