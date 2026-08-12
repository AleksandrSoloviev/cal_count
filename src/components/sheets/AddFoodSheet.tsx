import { useState } from "react";
import { X } from "lucide-react";
import type { Food, FoodComponent, Method, Nutrient } from "../../domain/types";
import en from "../../i18n/en";
import NutritionFields from "../NutritionFields";

const EMPTY: Nutrient = { calories: 0, protein: 0, fat: 0, carbs: 0 };

type Props = {
  prefill?: Food;
  onConfirm: (f: Omit<Food, "id" | "isDefault">) => void;
  onClose: () => void;
};

const AddFoodSheet = ({ prefill, onConfirm, onClose }: Props) => {
  const [name, setName] = useState(prefill?.name ?? "");
  const [method, setMethod] = useState<Method>(prefill?.method ?? "grams");
  const [perUnit, setPerUnit] = useState<Nutrient>(prefill?.perUnit ?? EMPTY);
  const [components, setComponents] = useState<FoodComponent[]>(
    prefill?.components ?? [
      { id: crypto.randomUUID(), name: "", decimals: false, nutrition: EMPTY },
    ],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (method === "custom") {
      if (components.length === 0) e.components = "Add at least one component";
      components.forEach((c, i) => {
        if (!c.name.trim()) e[`comp-${i}`] = "Component name required";
      });
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    if (method === "custom") {
      onConfirm({
        name: name.trim(),
        method,
        components: components.map((c) => ({ ...c, name: c.name.trim() })),
      });
      return;
    }
    onConfirm({ name: name.trim(), method, perUnit });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={en.addFood.title}>
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" aria-label={en.addFood.closeAria} onClick={onClose} />
      <div className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pb-safe">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{en.addFood.title}</h2>
            <button type="button" onClick={onClose} aria-label={en.addFood.closeAria} className="p-2 min-h-11 min-w-11">
              <X size={18} aria-hidden />
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
              {en.addFood.name}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 outline-none focus:border-foreground/40"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
              {en.addFood.method}
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5"
            >
              <option value="grams">{en.method.grams}</option>
              <option value="milliliters">{en.method.milliliters}</option>
              <option value="pieces">{en.method.pieces}</option>
              <option value="custom">{en.method.custom}</option>
            </select>
          </div>

          {method !== "custom" ? (
            <NutritionFields value={perUnit} onChange={setPerUnit} label={en.addFood.nutrition} />
          ) : (
            <div className="space-y-4">
              {components.map((c, i) => (
                <div key={c.id} className="rounded-xl border border-border p-3 space-y-2">
                  <input
                    value={c.name}
                    onChange={(e) =>
                      setComponents((prev) =>
                        prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)),
                      )
                    }
                    placeholder="Component name"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2"
                  />
                  {errors[`comp-${i}`] && (
                    <p className="text-red-500 text-xs">{errors[`comp-${i}`]}</p>
                  )}
                  <NutritionFields
                    value={c.nutrition}
                    onChange={(nutrition) =>
                      setComponents((prev) =>
                        prev.map((x) => (x.id === c.id ? { ...x, nutrition } : x)),
                      )
                    }
                  />
                  {components.length > 1 && (
                    <button
                      type="button"
                      className="text-xs text-red-500"
                      onClick={() => setComponents((prev) => prev.filter((x) => x.id !== c.id))}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {errors.components && <p className="text-red-500 text-xs">{errors.components}</p>}
              <button
                type="button"
                className="text-sm font-semibold"
                onClick={() =>
                  setComponents((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), name: "", decimals: false, nutrition: EMPTY },
                  ])
                }
              >
                {en.addFood.addComponent}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-primary text-primary-foreground rounded-xl py-4 text-sm font-semibold min-h-11"
          >
            {en.addFood.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFoodSheet;
