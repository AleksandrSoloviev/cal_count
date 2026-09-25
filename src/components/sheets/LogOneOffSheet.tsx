import { useId, useState, type ChangeEvent } from "react";
import { X } from "lucide-react";
import {
  validateOneOffDraft,
  type OneOffDraft,
  type OneOffFieldError,
} from "../../domain/oneOffEntry";
import type { Entry, Nutrient } from "../../domain/types";
import { ZERO_NUTRIENT } from "../../domain/nutrition";
import en from "../../i18n/en";
import NutritionFields from "../NutritionFields";

type Props = {
  prefill: Entry | null;
  onConfirm: (draft: OneOffDraft) => void;
  onClose: () => void;
};

const LogOneOffSheet = ({ prefill, onConfirm, onClose }: Props) => {
  const nameId = useId();
  const editing = prefill?.oneOff === true;
  const [name, setName] = useState(editing ? prefill.foodName : "");
  const [nutrition, setNutrition] = useState<Nutrient>(
    editing ? { ...prefill.nutrition } : { ...ZERO_NUTRIENT },
  );
  const [errors, setErrors] = useState<OneOffFieldError[]>([]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleNutritionChange = (next: Nutrient) => {
    setNutrition(next);
  };

  const handleConfirm = () => {
    const result = validateOneOffDraft({ name, nutrition });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    onConfirm({ name: result.name, nutrition: result.nutrition });
  };

  const handleClose = () => {
    onClose();
  };

  const nameError = errors.includes("name");
  const nutrientError = errors.some((code) => code !== "name");
  const title = editing ? en.oneOff.editTitle : en.oneOff.title;
  const confirmLabel = editing ? en.oneOff.save : en.oneOff.confirm;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={nameId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        aria-label={en.log.closeAria}
        onClick={handleClose}
      />
      <div data-sheet-scroll="" className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain pb-safe">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pb-8">
          <div className="flex items-start justify-between mb-2">
            <h2 id={nameId} className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              aria-label={en.log.closeAria}
              className="p-2 rounded-xl min-h-11 min-w-11 text-muted-foreground"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-6">{en.oneOff.notSaved}</p>

          <div className="mb-4">
            <label
              htmlFor={`${nameId}-name`}
              className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2"
            >
              {en.oneOff.name}
            </label>
            <input
              id={`${nameId}-name`}
              value={name}
              onChange={handleNameChange}
              placeholder={en.oneOff.namePlaceholder}
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-base outline-none focus:border-foreground/40 min-h-11"
            />
            {nameError && (
              <p className="text-red-500 text-xs mt-1.5">{en.oneOff.nameRequired}</p>
            )}
          </div>

          <NutritionFields value={nutrition} onChange={handleNutritionChange} />
          {nutrientError && (
            <p className="text-red-500 text-xs mt-1.5">{en.oneOff.nutrientInvalid}</p>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full bg-primary text-primary-foreground rounded-xl py-4 text-sm font-semibold active:scale-[0.98] min-h-11 mt-6"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogOneOffSheet;
