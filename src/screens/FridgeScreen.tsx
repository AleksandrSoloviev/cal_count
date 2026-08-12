import { Plus, Refrigerator as FridgeIcon } from "lucide-react";
import type { Food } from "../domain/types";
import en from "../i18n/en";
import FoodRow from "../components/FoodRow";

type Props = {
  foods: Food[];
  onSelectFood: (f: Food) => void;
  onAddNew: () => void;
  onEdit: (f: Food) => void;
  onDuplicate: (f: Food) => void;
  onDelete: (id: string) => void;
};

const FridgeScreen = ({ foods, onSelectFood, onAddNew, onEdit, onDuplicate, onDelete }: Props) => (
  <div className="px-4 pt-12 pb-6 max-w-md mx-auto relative">
    <div className="flex items-center justify-between mb-8">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
          {en.fridge.eyebrow}
        </p>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{en.fridge.title}</h1>
      </div>
      <button
        type="button"
        onClick={onAddNew}
        className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-2 rounded-xl active:scale-95 min-h-11"
      >
        <Plus size={13} aria-hidden /> {en.fridge.add}
      </button>
    </div>

    {foods.length === 0 ? (
      <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
        <FridgeIcon size={24} className="text-muted-foreground/40 mx-auto mb-3" aria-hidden />
        <p className="text-sm text-muted-foreground">{en.fridge.empty}</p>
      </div>
    ) : (
      <div className="bg-card rounded-2xl border border-border px-4">
        {foods.map((f) => (
          <FoodRow
            key={f.id}
            food={f}
            onSelect={() => onSelectFood(f)}
            onEdit={() => onEdit(f)}
            onDuplicate={() => onDuplicate(f)}
            onDelete={() => onDelete(f.id)}
          />
        ))}
      </div>
    )}
  </div>
);

export default FridgeScreen;
