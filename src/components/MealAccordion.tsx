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
  children: ReactNode;
};

const MealAccordion = ({ meal, expanded, panelId, onToggle, children }: Props) => {
  const handleToggle = () => {
    onToggle();
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <button
        type="button"
        id={`${panelId}-header`}
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={expanded ? en.meal.collapseAria(meal.index) : en.meal.expandAria(meal.index)}
        onClick={handleToggle}
        className="w-full text-left px-4 py-3 min-h-11"
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
      {expanded && (
        <div id={panelId} role="region" aria-labelledby={`${panelId}-header`} className="px-4 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
};

export default MealAccordion;
