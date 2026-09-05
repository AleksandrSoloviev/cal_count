import { displayVal, NUTRIENT_META } from "../domain/nutrition";
import type { CalorieCardStatus, Nutrient } from "../domain/types";
import en from "../i18n/en";

type Props = {
  title: string;
  itemCount?: number;
  target: Nutrient;
  actual: Nutrient;
  status?: CalorieCardStatus;
  ariaLabel: string;
  onClick: () => void;
};

const stripColor = (status?: CalorieCardStatus): string | undefined => {
  if (status === "red") return "var(--destructive)";
  if (status === "yellow") return "var(--status-under)";
  if (status === "green") return "var(--nutrient-calories)";
  return undefined;
};

const MacroCompareCard = ({
  title,
  itemCount,
  target,
  actual,
  status,
  ariaLabel,
  onClick,
}: Props) => {
  const handleClick = () => {
    onClick();
  };

  const rail = stripColor(status);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className="w-full text-left bg-card rounded-2xl border border-border overflow-hidden min-h-11"
    >
      <div className="flex">
        {rail && (
          <div className="w-1 flex-shrink-0 self-stretch" style={{ backgroundColor: rail }} aria-hidden />
        )}
        <div className="flex-1 min-w-0 px-4 py-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            {itemCount !== undefined && (
              <p className="text-xs text-muted-foreground mt-0.5">{en.history.items(itemCount)}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
              {en.history.target}
            </p>
            <div className="grid grid-cols-4 gap-1">
              {NUTRIENT_META.map((m) => (
                <div key={`t-${m.key}`} className="min-w-0">
                  <p className="text-[10px] text-muted-foreground truncate">{m.label}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {displayVal(target[m.key], m.unit)} {m.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
              {en.history.actual}
            </p>
            <div className="grid grid-cols-4 gap-1">
              {NUTRIENT_META.map((m) => (
                <div key={`a-${m.key}`} className="min-w-0">
                  <p className="text-[10px] text-muted-foreground truncate">{m.label}</p>
                  <p className="font-mono text-xs text-foreground">
                    {displayVal(actual[m.key], m.unit)} {m.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default MacroCompareCard;
