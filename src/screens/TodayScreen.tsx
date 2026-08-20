import { useEffect, useMemo, useState } from "react";
import { Plus, Settings, UtensilsCrossed } from "lucide-react";
import { fmtWeekRange, greetingForHour, weekBoundsSatFri } from "../domain/dates";
import { groupEntriesIntoMeals, resolveExpandedMealIndex } from "../domain/meals";
import { NUTRIENT_META, sumNutrition } from "../domain/nutrition";
import { entriesInWeek, remainingNutrient, weeklyGoals } from "../domain/week";
import type { CardMode, Entry, EntryFocus, Food, Goals } from "../domain/types";
import en from "../i18n/en";
import MealList from "../components/MealList";
import NutrientBar from "../components/NutrientBar";

type Props = {
  goals: Goals;
  entries: Entry[];
  allEntries: Entry[];
  today: string;
  foods: Food[];
  entryFocus: EntryFocus;
  focusSeq: number;
  cardMode: CardMode;
  onCardModeChange: (mode: CardMode) => void;
  onAddFood: () => void;
  onEditEntry: (e: Entry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenSettings: () => void;
};

const TodayScreen = ({
  goals,
  entries,
  allEntries,
  today,
  foods,
  entryFocus,
  focusSeq,
  cardMode,
  onCardModeChange,
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
  const dayLabel = new Date(`${today}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const dayTotals = useMemo(() => sumNutrition(entries), [entries]);
  const weekView = useMemo(() => {
    const window = weekBoundsSatFri(today);
    const weekEntries = entriesInWeek(allEntries, today);
    const current = sumNutrition(weekEntries);
    const goal = weeklyGoals(goals);
    return {
      window,
      current,
      goal,
      remaining: remainingNutrient(current, goal),
      rangeLabel: fmtWeekRange(window.start, window.end),
    };
  }, [allEntries, today, goals]);

  const barCurrent = cardMode === "day" ? dayTotals : weekView.current;
  const barGoal = cardMode === "day" ? goals : weekView.goal;

  const meals = useMemo(() => groupEntriesIntoMeals(entries), [entries]);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(() =>
    resolveExpandedMealIndex(meals, { kind: "latest" }),
  );
  const [appliedFocusSeq, setAppliedFocusSeq] = useState(-1);

  useEffect(() => {
    if (meals.length === 0) {
      setExpandedIndex(null);
      setAppliedFocusSeq(focusSeq);
      return;
    }
    if (appliedFocusSeq === -1 || focusSeq !== appliedFocusSeq) {
      setExpandedIndex(
        resolveExpandedMealIndex(meals, appliedFocusSeq === -1 ? { kind: "latest" } : entryFocus),
      );
      setAppliedFocusSeq(focusSeq);
      return;
    }
    setExpandedIndex((current) => {
      if (current === null) return null;
      if (current >= meals.length) return meals.length - 1;
      return current;
    });
  }, [meals, focusSeq, entryFocus, appliedFocusSeq]);

  const handleToggle = (index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  };

  const handleAddFood = () => {
    onAddFood();
  };

  const handleOpenSettings = () => {
    onOpenSettings();
  };

  const handleSelectDay = () => {
    onCardModeChange("day");
  };

  const handleSelectWeek = () => {
    onCardModeChange("week");
  };

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
          onClick={handleOpenSettings}
          aria-label={en.today.settingsAria}
          className="p-2.5 rounded-xl text-muted-foreground min-h-11 min-w-11"
        >
          <Settings size={18} aria-hidden />
        </button>
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-sm border border-border mb-6 space-y-4">
        <div
          role="radiogroup"
          aria-label={en.today.periodAria}
          className="flex rounded-xl bg-muted p-1 gap-1"
        >
          <button
            type="button"
            role="radio"
            aria-checked={cardMode === "day"}
            onClick={handleSelectDay}
            className={`flex-1 min-h-11 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              cardMode === "day"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {en.today.day}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={cardMode === "week"}
            onClick={handleSelectWeek}
            className={`flex-1 min-h-11 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              cardMode === "week"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {en.today.week}
          </button>
        </div>

        {cardMode === "week" && (
          <p className="text-xs text-muted-foreground text-center -mt-1">{weekView.rangeLabel}</p>
        )}

        {NUTRIENT_META.map((m) => (
          <NutrientBar
            key={m.key}
            label={m.label}
            unit={m.unit}
            color={m.color}
            current={barCurrent[m.key]}
            goal={barGoal[m.key]}
            remaining={cardMode === "week" ? weekView.remaining[m.key] : undefined}
            remainingLabel={cardMode === "week" ? en.today.left : undefined}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          {en.today.section}
        </h2>
        <button
          type="button"
          onClick={handleAddFood}
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
        <MealList
          meals={meals}
          foods={foods}
          expandedIndex={expandedIndex}
          onToggle={handleToggle}
          onEdit={onEditEntry}
          onDelete={onDeleteEntry}
        />
      )}
    </div>
  );
};

export default TodayScreen;
