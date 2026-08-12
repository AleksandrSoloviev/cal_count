import { useMemo } from "react";
import { CalendarDays, ChevronLeft } from "lucide-react";
import { fmtDate } from "../domain/dates";
import { sumNutrition } from "../domain/nutrition";
import type { Entry, Goals } from "../domain/types";
import en from "../i18n/en";

type Props = {
  allEntries: Entry[];
  goals: Goals;
  today: string;
  onSelectDay: (date: string) => void;
};

const HistoryScreen = ({ allEntries, goals, today, onSelectDay }: Props) => {
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

  return (
    <div className="px-4 pt-12 pb-6 max-w-md mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
          {en.history.eyebrow}
        </p>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{en.history.title}</h1>
      </div>

      {pastDays.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
          <CalendarDays size={24} className="text-muted-foreground/40 mx-auto mb-3" aria-hidden />
          <p className="text-sm text-muted-foreground">{en.history.emptyTitle}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">{en.history.emptyHint}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          {pastDays.map(({ date, totals, count }) => {
            const calPct = Math.round((totals.calories / goals.calories) * 100);
            return (
              <button
                key={date}
                type="button"
                onClick={() => onSelectDay(date)}
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
    </div>
  );
};

export default HistoryScreen;
