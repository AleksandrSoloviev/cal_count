import { useMemo } from "react";
import { CalendarDays, ChevronLeft } from "lucide-react";
import { calorieCardStatus } from "../domain/calorieStatus";
import { fmtDate, fmtWeekRange } from "../domain/dates";
import { sumNutrition } from "../domain/nutrition";
import type { Entry, Goals, HistoryPeriod, WeekWindow } from "../domain/types";
import { filterEntriesByDateRange, listCompletedWeekWindows, weeklyGoals } from "../domain/week";
import en from "../i18n/en";
import MacroCompareCard from "../components/MacroCompareCard";

type Props = {
  allEntries: Entry[];
  goals: Goals;
  today: string;
  historyPeriod: HistoryPeriod;
  openWeekPeriod: WeekWindow | null;
  onHistoryPeriodChange: (period: HistoryPeriod) => void;
  onOpenWeekPeriodChange: (window: WeekWindow | null) => void;
  onSelectDay: (date: string) => void;
};

const statusCopy = (status: ReturnType<typeof calorieCardStatus>): string => {
  if (status === "red") return en.history.statusOver;
  if (status === "yellow") return en.history.statusUnder;
  return en.history.statusOnTarget;
};

const HistoryScreen = ({
  allEntries,
  goals,
  today,
  historyPeriod,
  openWeekPeriod,
  onHistoryPeriodChange,
  onOpenWeekPeriodChange,
  onSelectDay,
}: Props) => {
  const pastDays = useMemo(() => {
    const dates = [...new Set(allEntries.map((e) => e.date))]
      .filter((d) => d !== today)
      .sort()
      .reverse();
    return dates.map((date) => {
      const dayEntries = allEntries.filter((e) => e.date === date);
      return { date, totals: sumNutrition(dayEntries), count: dayEntries.length };
    });
  }, [allEntries, today]);

  const weekCards = useMemo(() => {
    const windows = listCompletedWeekWindows(allEntries, today);
    const target = weeklyGoals(goals);
    return windows.map((window) => {
      const weekEntries = filterEntriesByDateRange(allEntries, window.start, window.end);
      const actual = sumNutrition(weekEntries);
      const status = calorieCardStatus(actual.calories, target.calories);
      return { window, actual, target, count: weekEntries.length, status };
    });
  }, [allEntries, today, goals]);

  const periodDays = useMemo(() => {
    if (!openWeekPeriod) return [];
    const inWeek = filterEntriesByDateRange(allEntries, openWeekPeriod.start, openWeekPeriod.end);
    const dates = [...new Set(inWeek.map((e) => e.date))].sort().reverse();
    return dates.map((date) => {
      const dayEntries = inWeek.filter((e) => e.date === date);
      const actual = sumNutrition(dayEntries);
      const status = calorieCardStatus(actual.calories, goals.calories);
      return { date, actual, count: dayEntries.length, status };
    });
  }, [allEntries, openWeekPeriod, goals]);

  const handleSelectDaily = () => {
    onHistoryPeriodChange("daily");
  };

  const handleSelectWeekly = () => {
    onHistoryPeriodChange("weekly");
  };

  const handleOpenWeek = (window: WeekWindow) => {
    onOpenWeekPeriodChange(window);
  };

  const handleBackFromPeriod = () => {
    onOpenWeekPeriodChange(null);
  };

  const handleSelectDay = (date: string) => {
    onSelectDay(date);
  };

  const showPeriod = historyPeriod === "weekly" && openWeekPeriod !== null;

  return (
    <div className="px-4 pt-12 pb-6 max-w-md mx-auto">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
          {en.history.eyebrow}
        </p>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{en.history.title}</h1>
      </div>

      <div
        role="radiogroup"
        aria-label={en.history.periodAria}
        className="flex rounded-xl bg-muted p-1 gap-1 mb-6"
      >
        <button
          type="button"
          role="radio"
          aria-checked={historyPeriod === "daily"}
          onClick={handleSelectDaily}
          className={`flex-1 min-h-11 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
            historyPeriod === "daily" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          {en.history.daily}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={historyPeriod === "weekly"}
          onClick={handleSelectWeekly}
          className={`flex-1 min-h-11 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
            historyPeriod === "weekly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          {en.history.weekly}
        </button>
      </div>

      {showPeriod && openWeekPeriod && (
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleBackFromPeriod}
            aria-label={en.history.backAria}
            className="p-2 min-h-11 min-w-11 text-muted-foreground"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            {fmtWeekRange(openWeekPeriod.start, openWeekPeriod.end)}
          </h2>
        </div>
      )}

      {showPeriod && periodDays.length === 0 && (
        <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
          <CalendarDays size={24} className="text-muted-foreground/40 mx-auto mb-3" aria-hidden />
          <p className="text-sm text-muted-foreground">{en.history.periodEmpty}</p>
        </div>
      )}

      {showPeriod && periodDays.length > 0 && (
        <div className="space-y-3">
          {periodDays.map((day) => (
            <MacroCompareCard
              key={day.date}
              title={fmtDate(day.date)}
              itemCount={day.count}
              target={goals}
              actual={day.actual}
              status={day.status}
              ariaLabel={en.history.dayCardAria(fmtDate(day.date), statusCopy(day.status))}
              onClick={() => handleSelectDay(day.date)}
            />
          ))}
        </div>
      )}

      {!showPeriod && historyPeriod === "daily" && pastDays.length === 0 && (
        <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
          <CalendarDays size={24} className="text-muted-foreground/40 mx-auto mb-3" aria-hidden />
          <p className="text-sm text-muted-foreground">{en.history.emptyTitle}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">{en.history.emptyHint}</p>
        </div>
      )}

      {!showPeriod && historyPeriod === "daily" && pastDays.length > 0 && (
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          {pastDays.map(({ date, totals, count }) => {
            const calPct = Math.round((totals.calories / goals.calories) * 100);
            return (
              <button
                key={date}
                type="button"
                onClick={() => handleSelectDay(date)}
                className="w-full flex items-center gap-4 px-4 py-4 text-left min-h-11"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{fmtDate(date)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{en.history.items(count)}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-mono text-sm font-medium">{Math.round(totals.calories)} kcal</p>
                  <p className="font-mono text-xs text-muted-foreground">{calPct}% of goal</p>
                </div>
                <ChevronLeft size={14} className="text-muted-foreground rotate-180 flex-shrink-0" aria-hidden />
              </button>
            );
          })}
        </div>
      )}

      {!showPeriod && historyPeriod === "weekly" && weekCards.length === 0 && (
        <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
          <CalendarDays size={24} className="text-muted-foreground/40 mx-auto mb-3" aria-hidden />
          <p className="text-sm text-muted-foreground">{en.history.emptyWeekTitle}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">{en.history.emptyWeekHint}</p>
        </div>
      )}

      {!showPeriod && historyPeriod === "weekly" && weekCards.length > 0 && (
        <div className="space-y-3">
          {weekCards.map((card) => {
            const range = fmtWeekRange(card.window.start, card.window.end);
            return (
              <MacroCompareCard
                key={card.window.start}
                title={range}
                itemCount={card.count}
                target={card.target}
                actual={card.actual}
                status={card.status}
                ariaLabel={en.history.weekCardAria(range, statusCopy(card.status))}
                onClick={() => handleOpenWeek(card.window)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
