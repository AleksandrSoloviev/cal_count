import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { dateOffset } from "../domain/dates";
import { displayVal, NUTRIENT_META, OVERFLOW_COLOR, r1, sumNutrition } from "../domain/nutrition";
import type { Entry, Goals, Nutrient } from "../domain/types";
import en from "../i18n/en";

type Props = {
  allEntries: Entry[];
  goals: Goals;
  today: string;
};

const StatsScreen = ({ allEntries, goals, today }: Props) => {
  const [activeNutrient, setActiveNutrient] = useState<keyof Nutrient>("calories");
  const activeMeta = NUTRIENT_META.find((m) => m.key === activeNutrient)!;

  const data = useMemo(() => {
    const result: { label: string; value: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = dateOffset(i);
      const dayEntries = allEntries.filter((e) => e.date === d);
      if (dayEntries.length === 0) continue;
      const totals = sumNutrition(dayEntries);
      result.push({
        date: d,
        label: d === today ? "Today" : new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" }),
        value: r1(totals[activeNutrient]),
      });
    }
    return result;
  }, [allEntries, activeNutrient, today]);

  const avg = useMemo(() => {
    if (data.length === 0) return 0;
    return r1(data.reduce((a, d) => a + d.value, 0) / data.length);
  }, [data]);

  const goal = goals[activeNutrient];

  return (
    <div className="px-4 pt-12 pb-6 max-w-md mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
          {en.stats.eyebrow}
        </p>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{en.stats.title}</h1>
      </div>

      <div className="grid grid-cols-4 gap-1.5 mb-6 bg-muted p-1.5 rounded-xl" role="tablist" aria-label="Nutrient">
        {NUTRIENT_META.map((m) => (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={activeNutrient === m.key}
            onClick={() => setActiveNutrient(m.key)}
            className={`rounded-lg py-2 text-xs font-semibold min-h-11 ${
              activeNutrient === m.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
            {en.stats.avg}
          </p>
          <p className="font-mono text-2xl font-semibold" style={{ color: activeMeta.color }}>
            {displayVal(avg, activeMeta.unit)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{activeMeta.unit}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
            {en.stats.goal}
          </p>
          <p className="font-mono text-2xl font-semibold">{displayVal(goal, activeMeta.unit)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{activeMeta.unit}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
          <TrendingUp size={24} className="text-muted-foreground/40 mx-auto mb-3" aria-hidden />
          <p className="text-sm text-muted-foreground">{en.stats.emptyTitle}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">{en.stats.emptyHint}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-4">
            {en.stats.chartTitle}
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} barSize={28} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8A8880" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8A8880" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(20,20,19,0.04)" }}
                contentStyle={{
                  background: "#fff",
                  border: "1px solid rgba(20,20,19,0.1)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(v: number) => [
                  `${displayVal(v, activeMeta.unit)} ${activeMeta.unit}`,
                  activeMeta.label,
                ]}
              />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.value > goal ? OVERFLOW_COLOR : activeMeta.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            {en.stats.overflowHint(displayVal(goal, activeMeta.unit), activeMeta.unit)}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsScreen;
