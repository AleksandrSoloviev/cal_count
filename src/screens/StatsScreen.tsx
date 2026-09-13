import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { displayVal, NUTRIENT_META, OVERFLOW_COLOR } from "../domain/nutrition";
import {
  buildStatsBuckets,
  statsAverageLogged,
  statsBarSegments,
  statsDailyEquivalent,
  statsTickIndices,
  statsYDomainMax,
} from "../domain/stats";
import type { Entry, Goals, Nutrient, StatsPeriod } from "../domain/types";
import en from "../i18n/en";

type Props = {
  allEntries: Entry[];
  goals: Goals;
  today: string;
  statsPeriod: StatsPeriod;
  onStatsPeriodChange: (period: StatsPeriod) => void;
};

type PlotRow = {
  key: string;
  label: string;
  value: number;
  withinGoal: number;
  overshoot: number;
};

const PERIODS: { id: StatsPeriod; label: string }[] = [
  { id: "7d", label: en.stats.period7d },
  { id: "30d", label: en.stats.period30d },
  { id: "90d", label: en.stats.period90d },
  { id: "12m", label: en.stats.period12m },
];

const CHART_TITLE: Record<StatsPeriod, string> = {
  "7d": en.stats.chartTitle7d,
  "30d": en.stats.chartTitle30d,
  "90d": en.stats.chartTitle90d,
  "12m": en.stats.chartTitle12m,
};

const PLOT_HEIGHT = 240;
const TICK_FILL = "var(--muted-foreground)";
const MAX_BAR_SIZE = 8;

const StatsScreen = ({ allEntries, goals, today, statsPeriod, onStatsPeriodChange }: Props) => {
  const [activeNutrient, setActiveNutrient] = useState<keyof Nutrient>("calories");
  const activeMeta = NUTRIENT_META.find((m) => m.key === activeNutrient)!;
  const dailyGoal = goals[activeNutrient];

  const handleSelectPeriod = (period: StatsPeriod) => {
    onStatsPeriodChange(period);
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
      }),
    [allEntries, today, statsPeriod],
  );

  const data = useMemo<PlotRow[]>(
    () =>
      buckets.map((bucket) => {
        const value = statsDailyEquivalent(bucket.totals[activeNutrient], bucket.intersectionDays);
        const segments = statsBarSegments(value, dailyGoal);
        return {
          key: bucket.key,
          label: statsPeriod === "7d" && bucket.key === today ? en.stats.todayLabel : bucket.label,
          value,
          withinGoal: segments.withinGoal,
          overshoot: segments.overshoot,
        };
      }),
    [buckets, statsPeriod, today, activeNutrient, dailyGoal],
  );

  const avg = useMemo(() => statsAverageLogged(buckets, activeNutrient), [buckets, activeNutrient]);
  const yMax = useMemo(
    () => statsYDomainMax(data.map((row) => row.value), dailyGoal),
    [data, dailyGoal],
  );
  const tickLabels = useMemo(
    () => statsTickIndices(data.length).map((i) => data[i]?.label).filter(Boolean),
    [data],
  );
  const neverLogged = allEntries.length === 0;
  const isLinePeriod = statsPeriod === "30d";

  return (
    <div className="px-4 pt-12 pb-6 max-w-md mx-auto">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
          {en.stats.eyebrow}
        </p>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{en.stats.title}</h1>
      </div>

      <div
        role="radiogroup"
        aria-label={en.stats.periodAria}
        className="grid grid-cols-4 gap-1.5 mb-2 bg-muted p-1.5 rounded-xl"
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

      <div className="flex gap-1 mb-4" role="tablist" aria-label={en.stats.nutrientAria}>
        {NUTRIENT_META.map((m) => {
          const selected = activeNutrient === m.key;
          return (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => handleSelectNutrient(m.key)}
              className={`flex-1 min-h-11 rounded-lg text-xs font-semibold ${
                selected ? "text-foreground" : "text-muted-foreground"
              }`}
              style={selected ? { color: m.color, boxShadow: `inset 0 -2px 0 ${m.color}` } : undefined}
            >
              {m.label}
            </button>
          );
        })}
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
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            {CHART_TITLE[statsPeriod]}
          </p>
          <div className="w-full" style={{ height: PLOT_HEIGHT }}>
            <ResponsiveContainer width="100%" height={PLOT_HEIGHT}>
              {isLinePeriod ? (
                <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    ticks={tickLabels}
                    interval={0}
                    tick={{ fontSize: 11, fill: TICK_FILL }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, yMax]}
                    width={36}
                    tick={{ fontSize: 10, fill: TICK_FILL }}
                    tickFormatter={(v: number) => String(Math.round(v))}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(20,20,19,0.12)" }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [
                      `${displayVal(v, activeMeta.unit)} ${activeMeta.unit}`,
                      activeMeta.label,
                    ]}
                  />
                  <ReferenceLine y={dailyGoal} stroke={TICK_FILL} strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="value"
                    fill={activeMeta.color}
                    fillOpacity={0.2}
                    stroke="none"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={activeMeta.color}
                    strokeWidth={2}
                    isAnimationActive={false}
                    dot={(props: { cx?: number; cy?: number; index?: number; payload?: PlotRow }) => {
                      const { cx, cy, payload, index } = props;
                      if (cx == null || cy == null || !payload) {
                        return <g key={`dot-empty-${index ?? 0}`} />;
                      }
                      const fill = payload.overshoot > 0 ? OVERFLOW_COLOR : activeMeta.color;
                      return <circle key={`dot-${payload.key}`} cx={cx} cy={cy} r={3} fill={fill} />;
                    }}
                    activeDot={false}
                  />
                </ComposedChart>
              ) : (
                <BarChart data={data} maxBarSize={MAX_BAR_SIZE} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    ticks={tickLabels}
                    interval={0}
                    tick={{ fontSize: 11, fill: TICK_FILL }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, yMax]}
                    width={36}
                    tick={{ fontSize: 10, fill: TICK_FILL }}
                    tickFormatter={(v: number) => String(Math.round(v))}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(20,20,19,0.04)" }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(_v: number, _name: string, item: { payload?: PlotRow }) => [
                      `${displayVal(item.payload?.value ?? 0, activeMeta.unit)} ${activeMeta.unit}`,
                      activeMeta.label,
                    ]}
                  />
                  <ReferenceLine y={dailyGoal} stroke={TICK_FILL} strokeDasharray="4 4" />
                  <Bar dataKey="withinGoal" stackId="intake" fill={activeMeta.color} isAnimationActive={false} />
                  <Bar
                    dataKey="overshoot"
                    stackId="intake"
                    fill={OVERFLOW_COLOR}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">{en.stats.overflowHint}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
            {en.stats.avgDay}
          </p>
          <p className="font-mono text-2xl font-semibold" style={{ color: activeMeta.color }}>
            {displayVal(avg, activeMeta.unit)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{activeMeta.unit}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
            {en.stats.goalDay}
          </p>
          <p className="font-mono text-2xl font-semibold">{displayVal(dailyGoal, activeMeta.unit)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{activeMeta.unit}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsScreen;
