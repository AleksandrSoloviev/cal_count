import { Plus, Settings } from "lucide-react";
import { UtensilsCrossed } from "lucide-react";
import { greetingForHour } from "../domain/dates";
import { NUTRIENT_META, sumNutrition } from "../domain/nutrition";
import type { Entry, Food, Goals } from "../domain/types";
import en from "../i18n/en";
import EntryRow from "../components/EntryRow";
import NutrientBar from "../components/NutrientBar";

type Props = {
  goals: Goals;
  entries: Entry[];
  foods: Food[];
  onAddFood: () => void;
  onEditEntry: (e: Entry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenSettings: () => void;
};

const TodayScreen = ({
  goals,
  entries,
  foods,
  onAddFood,
  onEditEntry,
  onDeleteEntry,
  onOpenSettings,
}: Props) => {
  const now = new Date();
  const g = greetingForHour(now.getHours());
  const greeting =
    g === "morning"
      ? en.today.greetingMorning
      : g === "afternoon"
        ? en.today.greetingAfternoon
        : en.today.greetingEvening;
  const dayLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const totals = sumNutrition(entries);

  return (
    <div className="px-4 pt-12 pb-6 max-w-md mx-auto">
      <div className="mb-8 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
            {greeting}
          </p>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">{dayLabel}</h1>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={en.today.settingsAria}
          className="p-2.5 rounded-xl text-muted-foreground min-h-11 min-w-11"
        >
          <Settings size={18} aria-hidden />
        </button>
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-sm border border-border mb-6 space-y-4">
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

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          {en.today.section}
        </h2>
        <button
          type="button"
          onClick={onAddFood}
          className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg active:scale-95 min-h-11"
        >
          <Plus size={12} aria-hidden />
          {en.today.addFood}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
          <UtensilsCrossed size={24} className="text-muted-foreground/40 mx-auto mb-3" aria-hidden />
          <p className="text-sm text-muted-foreground">{en.today.emptyTitle}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">{en.today.emptyHint}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border px-4">
          {entries.map((e) => (
            <EntryRow
              key={e.id}
              entry={e}
              foods={foods}
              onEdit={() => onEditEntry(e)}
              onDelete={() => onDeleteEntry(e.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayScreen;
