import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { displayVal, NUTRIENT_META } from "../domain/nutrition";
import type { Meal } from "../domain/types";
import en from "../i18n/en";

type Props = {
  meal: Meal;
  expanded: boolean;
  panelId: string;
  onToggle: () => void;
  onMove?: () => void;
  children: ReactNode;
};

const MealAccordion = ({ meal, expanded, panelId, onToggle, onMove, children }: Props) => {
  const handleToggle = () => {
    onToggle();
  };

  const handleMove = () => {
    onMove?.();
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-start">
        <button
          type="button"
          id={`${panelId}-header`}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={expanded ? en.meal.collapseAria(meal.index) : en.meal.expandAria(meal.index)}
          onClick={handleToggle}
          className="flex-1 min-w-0 text-left px-4 py-3 min-h-11"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">{en.meal.title(meal.index)}</span>
            <ChevronDown
              size={16}
              aria-hidden
              className={`text-muted-foreground flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {NUTRIENT_META.map((m) => (
              <div
                key={m.key}
                className="min-w-0"
                aria-label={`${m.label} ${displayVal(meal.nutrition[m.key], m.unit)} ${m.unit}`}
              >
                <span className="block text-[10px] font-semibold tracking-wide uppercase text-muted-foreground truncate">
                  {m.label}
                </span>
                <span className="font-mono text-xs font-medium" style={{ color: m.color }}>
                  {displayVal(meal.nutrition[m.key], m.unit)}
                  <span className="text-muted-foreground font-normal"> {m.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </button>
        {onMove && (
          <button
            id={`${panelId}-move`}
            type="button"
            onClick={handleMove}
            aria-label={en.meal.moveAria(meal.index)}
            className="flex-shrink-0 px-3 py-3 text-xs font-semibold text-muted-foreground min-h-11 min-w-11"
          >
            {en.meal.move}
          </button>
        )}
      </div>
      {expanded && (
        <div id={panelId} role="region" aria-labelledby={`${panelId}-header`} className="px-4 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
};

export default MealAccordion;
