import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { calcNutrition, displayVal, NUTRIENT_META } from "../../domain/nutrition";
import { maxQtyForMethod, validateCompQty, validateSimpleQty } from "../../domain/validation";
import type { Entry, Food, Method } from "../../domain/types";
import en from "../../i18n/en";

type Props = {
  food: Food;
  prefill?: Entry | null;
  queueActive?: boolean;
  queueRemaining?: number;
  onConfirm: (food: Food, qty?: number, compQty?: Record<string, number>) => void;
  onClose: () => void;
};

const methodUnit = (m: Method) => {
  if (m === "grams") return "g";
  if (m === "milliliters") return "ml";
  if (m === "pieces") return "pcs";
  return "";
};

const LogFoodSheet = ({
  food,
  prefill,
  queueActive = false,
  queueRemaining = 0,
  onConfirm,
  onClose,
}: Props) => {
  const [qty, setQty] = useState(prefill?.qty !== undefined ? String(prefill.qty) : "");
  const [compQty, setCompQty] = useState<Record<string, string>>(() => {
    if (food.method === "custom" && food.components) {
      return Object.fromEntries(
        food.components.map((c) => [
          c.id,
          prefill?.compQty?.[c.id] !== undefined ? String(prefill.compQty[c.id]) : "",
        ]),
      );
    }
    return {};
  });
  const [error, setError] = useState("");
  const maxQty = maxQtyForMethod(food.method);

  const preview = useMemo(() => {
    if (food.method === "custom") {
      const parsed: Record<string, number> = {};
      for (const id in compQty) {
        const v = parseFloat(compQty[id]);
        parsed[id] = Number.isNaN(v) ? 0 : v;
      }
      return calcNutrition(food, undefined, parsed);
    }
    const v = parseFloat(qty);
    if (Number.isNaN(v) || v <= 0) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    return calcNutrition(food, v);
  }, [food, qty, compQty]);

  const canConfirm = useMemo(() => {
    if (food.method === "custom") {
      return Object.values(compQty).some((v) => parseFloat(v) > 0);
    }
    const v = parseFloat(qty);
    return !Number.isNaN(v) && v > 0 && v <= maxQty;
  }, [food, qty, compQty, maxQty]);

  const handleConfirm = () => {
    if (food.method === "custom") {
      const result = validateCompQty(compQty);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onConfirm(food, undefined, result.parsed);
      return;
    }
    const result = validateSimpleQty(food.method, qty);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onConfirm(food, result.qty);
  };

  const hint =
    food.method === "grams"
      ? en.log.hintGrams
      : food.method === "milliliters"
        ? en.log.hintMl
        : food.method === "pieces"
          ? en.log.hintPieces
          : en.log.hintCustom;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={food.name}>
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" aria-label={en.log.closeAria} onClick={onClose} />
      <div className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pb-safe">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{food.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
              {queueActive && (
                <p className="text-xs text-muted-foreground mt-1">
                  {queueRemaining > 0 ? en.log.queueMore(queueRemaining) : en.log.queueLast}
                </p>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label={en.log.closeAria} className="p-2 rounded-xl min-h-11 min-w-11 text-muted-foreground">
              <X size={18} aria-hidden />
            </button>
          </div>

          {food.method !== "custom" ? (
            <div className="mb-6">
              <div
                className={`flex items-center rounded-xl border bg-card px-4 py-3.5 ${
                  error ? "border-red-400" : "border-border focus-within:border-foreground/40"
                }`}
              >
                <input
                  type="number"
                  inputMode="decimal"
                  value={qty}
                  onChange={(e) => {
                    setQty(e.target.value);
                    setError("");
                  }}
                  placeholder={`0–${maxQty}`}
                  step={food.method === "pieces" ? "1" : "0.1"}
                  min={0}
                  max={maxQty}
                  autoFocus
                  className="flex-1 bg-transparent outline-none font-mono text-2xl text-foreground placeholder:text-muted-foreground/30"
                />
                <span className="text-muted-foreground text-sm ml-2">{methodUnit(food.method)}</span>
              </div>
              {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
              {food.method !== "pieces" && (
                <p className="text-xs text-muted-foreground mt-2">
                  {en.log.per100(food.method === "grams" ? "g" : "ml")}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-6 space-y-3">
              {food.components?.map((c) => (
                <div key={c.id}>
                  <label className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
                    {c.name}
                  </label>
                  <div className="flex items-center rounded-xl border border-border bg-card px-4 py-3 focus-within:border-foreground/40">
                    <input
                      type="number"
                      inputMode={c.decimals ? "decimal" : "numeric"}
                      value={compQty[c.id] ?? ""}
                      onChange={(e) => setCompQty((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      placeholder="0"
                      step={c.decimals ? "0.1" : "1"}
                      min={0}
                      className="flex-1 bg-transparent outline-none font-mono text-xl text-foreground placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>
              ))}
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
          )}

          <div className="bg-muted rounded-xl p-4 mb-6">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
              {en.log.preview}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {NUTRIENT_META.map((m) => (
                <div key={m.key} className="text-center">
                  <p className="font-mono text-base font-semibold" style={{ color: m.color }}>
                    {displayVal(preview[m.key], m.unit)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.unit}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full bg-primary text-primary-foreground rounded-xl py-4 text-sm font-semibold disabled:opacity-25 active:scale-[0.98] min-h-11"
          >
            {prefill ? en.log.update : en.log.add}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogFoodSheet;
