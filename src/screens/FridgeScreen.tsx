import { useEffect, useState } from "react";
import { Plus, Refrigerator as FridgeIcon } from "lucide-react";
import type { Food } from "../domain/types";
import en from "../i18n/en";
import FoodRow from "../components/FoodRow";

type Props = {
  foods: Food[];
  fridgeResetSeq: number;
  onSelectFood: (f: Food) => void;
  onStartLogQueue: (foods: Food[]) => void;
  onAddNew: () => void;
  onEdit: (f: Food) => void;
  onDuplicate: (f: Food) => void;
  onDelete: (id: string) => void;
};

const FridgeScreen = ({
  foods,
  fridgeResetSeq,
  onSelectFood,
  onStartLogQueue,
  onAddNew,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) => {
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelecting(false);
    setSelectedIds([]);
  }, [fridgeResetSeq]);

  const handleEnterSelect = () => {
    setSelecting(true);
    setSelectedIds([]);
  };

  const handleExitSelect = () => {
    setSelecting(false);
    setSelectedIds([]);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id];
    });
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const handleLogSelected = () => {
    const selectedFoods = selectedIds
      .map((id) => foods.find((f) => f.id === id))
      .filter((f): f is Food => Boolean(f));
    if (selectedFoods.length === 0) return;
    onStartLogQueue(selectedFoods);
  };

  return (
    <div className="px-4 pt-12 pb-6 max-w-md mx-auto relative">
      <div className="flex items-center justify-between mb-8 gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-0.5">
            {en.fridge.eyebrow}
          </p>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">{en.fridge.title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {foods.length > 0 && (
            <button
              type="button"
              onClick={selecting ? handleExitSelect : handleEnterSelect}
              aria-pressed={selecting}
              className="text-xs font-semibold px-3 py-2 rounded-xl min-h-11 text-muted-foreground"
            >
              {selecting ? en.fridge.doneSelect : en.fridge.select}
            </button>
          )}
          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-2 rounded-xl active:scale-95 min-h-11"
          >
            <Plus size={13} aria-hidden /> {en.fridge.add}
          </button>
        </div>
      </div>

      {foods.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
          <FridgeIcon size={24} className="text-muted-foreground/40 mx-auto mb-3" aria-hidden />
          <p className="text-sm text-muted-foreground">{en.fridge.empty}</p>
        </div>
      ) : (
        <div className={`bg-card rounded-2xl border border-border px-4 ${selecting ? "mb-20" : ""}`}>
          {foods.map((f) => (
            <FoodRow
              key={f.id}
              food={f}
              selecting={selecting}
              selected={selectedIds.includes(f.id)}
              onSelect={() => onSelectFood(f)}
              onToggleSelect={() => handleToggleSelect(f.id)}
              onEdit={() => onEdit(f)}
              onDuplicate={() => onDuplicate(f)}
              onDelete={() => handleDelete(f.id)}
            />
          ))}
        </div>
      )}

      {selecting && foods.length > 0 && (
        <div className="fixed bottom-24 inset-x-0 z-20 px-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleLogSelected}
            disabled={selectedIds.length === 0}
            className="w-full bg-primary text-primary-foreground rounded-xl py-4 text-sm font-semibold disabled:opacity-25 active:scale-[0.98] min-h-11"
          >
            {en.fridge.logSelected(selectedIds.length)}
          </button>
        </div>
      )}
    </div>
  );
};

export default FridgeScreen;
