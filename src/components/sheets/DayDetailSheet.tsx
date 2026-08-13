import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { fmtDate } from "../../domain/dates";
import { groupEntriesIntoMeals } from "../../domain/meals";
import { NUTRIENT_META, sumNutrition } from "../../domain/nutrition";
import type { Entry, Food, Goals } from "../../domain/types";
import en from "../../i18n/en";
import MealList from "../MealList";
import NutrientBar from "../NutrientBar";

type Props = {
  date: string;
  entries: Entry[];
  foods: Food[];
  goals: Goals;
  onClose: () => void;
};

const DayDetailSheet = ({ date, entries, foods, goals, onClose }: Props) => {
  const totals = sumNutrition(entries);
  const meals = useMemo(() => groupEntriesIntoMeals(entries), [entries]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(() => {
    const initial = groupEntriesIntoMeals(entries);
    return initial.length === 0 ? null : initial.length - 1;
  });

  const handleToggle = (index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={fmtDate(date)}>
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" aria-label={en.dayDetail.closeAria} onClick={handleClose} />
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
            <button type="button" onClick={handleClose} aria-label={en.dayDetail.closeAria} className="p-2 min-h-11 min-w-11 text-muted-foreground">
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
            <MealList
              meals={meals}
              foods={foods}
              expandedIndex={expandedIndex}
              idPrefix="day-meal"
              onToggle={handleToggle}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DayDetailSheet;
