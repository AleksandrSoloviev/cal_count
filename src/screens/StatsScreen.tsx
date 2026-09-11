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
import { displayVal, NUTRIENT_META, OVERFLOW_COLOR, r1 } from "../domain/nutrition";
import {
  buildStatsBuckets,
  statsBarOverflows,
  statsFullBucketGoal,
} from "../domain/stats";
import type { Entry, Goals, Nutrient, StatsGranularity, StatsPeriod } from "../domain/types";
import en from "../i18n/en";

type Props = {
  allEntries: Entry[];
  goals: Goals;
  today: string;
  statsPeriod: StatsPeriod;
  statsGranularity: StatsGranularity;
  onStatsPeriodChange: (period: StatsPeriod) => void;
  onStatsGranularityChange: (granularity: StatsGranularity) => void;
};

const PERIODS: { id: StatsPeriod; label: string }[] = [
  { id: "7d", label: en.stats.period7d },
  { id: "30d", label: en.stats.period30d },
  { id: "90d", label: en.stats.period90d },
  { id: "12m", label: en.stats.period12m },
];

const GRAINS: { id: StatsGranularity; label: string }[] = [
  { id: "day", label: en.stats.grainDay },
  { id: "week", label: en.stats.grainWeek },
  { id: "month", label: en.stats.grainMonth },
];

const CHART_TITLE: Record<StatsPeriod, string> = {
  "7d": en.stats.chartTitle7d,
  "30d": en.stats.chartTitle30d,
  "90d": en.stats.chartTitle90d,
  "12m": en.stats.chartTitle12m,
};

const AVG_CAPTION: Record<StatsGranularity, string> = {
  day: en.stats.avgDay,
  week: en.stats.avgWeek,
  month: en.stats.avgMonth,
};

const GOAL_CAPTION: Record<StatsGranularity, string> = {
  day: en.stats.goalDay,
  week: en.stats.goalWeek,
  month: en.stats.goalMonth,
};

const TICK_FILL = "#8A8880";

const StatsScreen = ({
  allEntries,
  goals,
  today,
  statsPeriod,
  statsGranularity,
  onStatsPeriodChange,
  onStatsGranularityChange,
}: Props) => {
  const [activeNutrient, setActiveNutrient] = useState<keyof Nutrient>("calories");
  const activeMeta = NUTRIENT_META.find((m) => m.key === activeNutrient)!;

  const handleSelectPeriod = (period: StatsPeriod) => {
    onStatsPeriodChange(period);
  };

  const handleSelectGranularity = (granularity: StatsGranularity) => {
    onStatsGranularityChange(granularity);
  };

  const handleSelectNutrient = (key: keyof Nutrient) => {
    setActiveNutrient(key);
  };

  const buckets = useMemo(
    () =>
      buildStatsBuckets({
        entries: allEntries,
        today,
        period: statsPeriod,
        granularity: statsGranularity,
      }),
    [allEntries, today, statsPeriod, statsGranularity],
  );

  const data = useMemo(
    () =>
      buckets.map((bucket) => ({
        label:
          statsPeriod === "7d" && statsGranularity === "day" && bucket.key === today
            ? en.stats.todayLabel
            : bucket.label,
        value: r1(bucket.totals[activeNutrient]),
        intersectionDays: bucket.intersectionDays,
      })),
    [buckets, statsPeriod, statsGranularity, today, activeNutrient],
  );

  const avg = useMemo(() => {
    if (data.length === 0) return 0;
    return r1(data.reduce((sum, row) => sum + row.value, 0) / data.length);
  }, [data]);

  const goal = statsFullBucketGoal(statsGranularity, goals[activeNutrient], today);
  const neverLogged = allEntries.length === 0;
  const plotWidth = Math.max(data.length * 40, 280);

  return (
    <div className="px-4 pt-12 pb-6 max-w-md mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
          {en.stats.eyebrow}
        </p>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{en.stats.title}</h1>
      </div>

      <div
        role="radiogroup"
        aria-label={en.stats.periodAria}
        className="grid grid-cols-4 gap-1.5 mb-3 bg-muted p-1.5 rounded-xl"
      >
        {PERIODS.map((period) => (
          <button
            key={period.id}
            type="button"
            role="radio"
            aria-checked={statsPeriod === period.id}
            onClick={() => handleSelectPeriod(period.id)}
            className={`rounded-lg py-2 px-0.5 text-xs font-semibold leading-tight min-h-11 ${
              statsPeriod === period.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div
        role="radiogroup"
        aria-label={en.stats.granularityAria}
        className="flex rounded-xl bg-muted p-1 gap-1 mb-6"
      >
        {GRAINS.map((grain) => (
          <button
            key={grain.id}
            type="button"
            role="radio"
            aria-checked={statsGranularity === grain.id}
            onClick={() => handleSelectGranularity(grain.id)}
            className={`flex-1 min-h-11 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              statsGranularity === grain.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {grain.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5 mb-6 bg-muted p-1.5 rounded-xl" role="tablist" aria-label={en.stats.nutrientAria}>
        {NUTRIENT_META.map((m) => (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={activeNutrient === m.key}
            onClick={() => handleSelectNutrient(m.key)}
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
            {AVG_CAPTION[statsGranularity]}
          </p>
          <p className="font-mono text-2xl font-semibold" style={{ color: activeMeta.color }}>
            {displayVal(avg, activeMeta.unit)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{activeMeta.unit}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
            {GOAL_CAPTION[statsGranularity]}
          </p>
          <p className="font-mono text-2xl font-semibold">{displayVal(goal, activeMeta.unit)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{activeMeta.unit}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
          <TrendingUp size={24} className="text-muted-foreground/40 mx-auto mb-3" aria-hidden />
          <p className="text-sm text-muted-foreground">
            {neverLogged ? en.stats.emptyTitle : en.stats.emptyPeriodTitle}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {neverLogged ? en.stats.emptyHint : en.stats.emptyPeriodHint}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-4">
            {CHART_TITLE[statsPeriod]}
          </p>
          <div className="overflow-x-auto">
            <div className="h-[180px]" style={{ width: plotWidth, minWidth: "100%" }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} barSize={28} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: TICK_FILL }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: TICK_FILL }} axisLine={false} tickLine={false} />
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
                    {data.map((row, i) => (
                      <Cell
                        key={`${row.label}-${i}`}
                        fill={
                          statsBarOverflows(row.value, goals[activeNutrient], row.intersectionDays)
                            ? OVERFLOW_COLOR
                            : activeMeta.color
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            {en.stats.overflowHintBucket(statsGranularity)}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsScreen;
