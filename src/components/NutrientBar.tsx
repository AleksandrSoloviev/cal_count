import { displayVal, OVERFLOW_COLOR } from "../domain/nutrition";

type Props = {
  label: string;
  unit: string;
  color: string;
  current: number;
  goal: number;
  /** When set (including 0), show explicit remaining for Week mode. */
  remaining?: number;
  remainingLabel?: string;
};

const NutrientBar = ({
  label,
  unit,
  color,
  current,
  goal,
  remaining,
  remainingLabel,
}: Props) => {
  const pct = goal > 0 ? (current / goal) * 100 : 0;
  const over = pct > 100;
  const fill = Math.min(pct, 100);
  const excess = Math.max(0, current - goal);
  const barColor = over ? OVERFLOW_COLOR : color;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
          {label}
        </span>
        <div className="flex items-baseline gap-1 flex-shrink-0 flex-wrap justify-end">
          <span className="font-mono text-sm font-medium" style={{ color: barColor }}>
            {displayVal(current, unit)}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            / {displayVal(goal, unit)} {unit}
          </span>
          {remaining !== undefined && remainingLabel !== undefined && (
            <span className="font-mono text-xs text-muted-foreground">
              {remainingLabel} {displayVal(remaining, unit)}
            </span>
          )}
          {over && (
            <span className="font-mono text-xs font-semibold" style={{ color: OVERFLOW_COLOR }}>
              +{displayVal(excess, unit)}
            </span>
          )}
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${fill}%`, background: barColor }}
        />
      </div>
    </div>
  );
};

export default NutrientBar;
