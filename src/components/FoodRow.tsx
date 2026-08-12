import { useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import type { Food } from "../domain/types";
import en from "../i18n/en";

type Props = {
  food: Food;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

const methodLabel = (f: Food): string => {
  if (f.method === "grams") return "per 100 g";
  if (f.method === "milliliters") return "per 100 ml";
  if (f.method === "pieces") return "per piece";
  return f.components?.map((c) => c.name).join(" + ") ?? "custom";
};

const nutritionSummary = (f: Food): string => {
  if (f.method === "custom" && f.components) {
    const total = f.components.reduce(
      (a, c) => ({
        calories: a.calories + c.nutrition.calories,
        protein: a.protein + c.nutrition.protein,
        fat: a.fat + c.nutrition.fat,
        carbs: a.carbs + c.nutrition.carbs,
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 },
    );
    return `${Math.round(total.calories)} kcal`;
  }
  if (f.perUnit) return `${Math.round(f.perUnit.calories)} kcal`;
  return "";
};

const FoodRow = ({ food, onSelect, onEdit, onDuplicate, onDelete }: Props) => {
  const [menu, setMenu] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="relative flex items-center gap-3 py-3.5 border-b border-border last:border-0">
      <button type="button" onClick={onSelect} className="flex-1 flex items-center gap-3 min-w-0 text-left min-h-11">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">{food.name}</span>
            {food.isDefault && (
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex-shrink-0">
                {en.fridge.default}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{methodLabel(food)}</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="font-mono text-xs text-muted-foreground">{nutritionSummary(food)}</span>
          </div>
        </div>
      </button>

      {confirming ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button type="button" onClick={() => setConfirming(false)} className="text-xs text-muted-foreground px-2 py-1 rounded-lg min-h-11">
            {en.entry.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete();
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
            onClick={() => setMenu(!menu)}
            aria-label={en.fridge.menuAria}
            className="p-2.5 rounded-lg text-muted-foreground min-h-11 min-w-11"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menu && (
            <div className="absolute right-4 top-12 bg-card border border-border rounded-xl shadow-lg z-10 py-1 min-w-[140px]">
              <button
                type="button"
                onClick={() => {
                  onEdit();
                  setMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground w-full text-left min-h-11"
              >
                <Pencil size={14} aria-hidden /> {en.fridge.edit}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDuplicate();
                  setMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground w-full text-left min-h-11"
              >
                <Copy size={14} aria-hidden /> {en.fridge.duplicate}
              </button>
              {!food.isDefault && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(true);
                    setMenu(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 w-full text-left min-h-11"
                >
                  <Trash2 size={14} aria-hidden /> {en.fridge.delete}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodRow;
