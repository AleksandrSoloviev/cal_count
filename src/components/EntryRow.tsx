import { useState } from "react";
import { Trash2 } from "lucide-react";
import { fmtTime } from "../domain/dates";
import type { Entry, Food } from "../domain/types";
import en from "../i18n/en";

type Props = {
  entry: Entry;
  foods: Food[];
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
};

const describeQty = (e: Entry, foods: Food[]): string => {
  if (e.method === "custom" && e.compQty) {
    const food = foods.find((f) => f.id === e.foodId);
    if (food?.components) {
      return food.components
        .filter((c) => (e.compQty?.[c.id] ?? 0) > 0)
        .map((c) => {
          const q = e.compQty?.[c.id] ?? 0;
          return `${q} ${c.name.toLowerCase()}${q !== 1 ? "s" : ""}`;
        })
        .join(", ");
    }
  }
  if (e.qty !== undefined) {
    const unit = e.method === "grams" ? "g" : e.method === "milliliters" ? "ml" : " pcs";
    return `${e.qty}${unit}`;
  }
  return "";
};

const EntryRow = ({ entry, foods, onEdit, onDelete, readOnly = false }: Props) => {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground truncate">{entry.foodName}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {describeQty(entry, foods)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-xs text-muted-foreground">{fmtTime(entry.ts)}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="font-mono text-xs font-medium text-foreground">
            {Math.round(entry.nutrition.calories)} kcal
          </span>
        </div>
      </div>
      {readOnly ? null : confirming ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-xs text-muted-foreground px-2 py-1 rounded-lg min-h-11"
          >
            {en.entry.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete?.();
              setConfirming(false);
            }}
            className="text-xs text-red-500 font-medium px-2 py-1 rounded-lg min-h-11"
          >
            {en.entry.delete}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onEdit}
            aria-label={en.entry.editAria}
            className="p-2.5 rounded-lg text-muted-foreground min-h-11 min-w-11"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={en.entry.deleteAria}
            className="p-2.5 rounded-lg text-muted-foreground min-h-11 min-w-11"
          >
            <Trash2 size={14} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
};

export default EntryRow;
