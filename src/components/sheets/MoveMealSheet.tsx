import { useLayoutEffect, useRef, useState, type ChangeEvent } from "react";
import { X } from "lucide-react";
import en from "../../i18n/en";

type Props = {
  sourceDate: string;
  onConfirm: (targetDate: string) => void;
  onClose: () => void;
};

const MoveMealSheet = ({ sourceDate, onConfirm, onClose }: Props) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [targetDate, setTargetDate] = useState(sourceDate);
  const sameDate = targetDate === sourceDate;

  useLayoutEffect(() => {
    dateInputRef.current?.focus();
  }, []);

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTargetDate(event.target.value);
  };

  const handleConfirm = () => {
    if (sameDate || !targetDate) return;
    onConfirm(targetDate);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={en.moveMeal.title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        aria-label={en.moveMeal.closeAria}
        onClick={handleClose}
      />
      <div className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pb-safe">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pb-8">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">{en.moveMeal.title}</h2>
            <button
              type="button"
              onClick={handleClose}
              aria-label={en.moveMeal.closeAria}
              className="p-2 rounded-xl min-h-11 min-w-11 text-muted-foreground"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          <label
            htmlFor="move-meal-date"
            className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1.5"
          >
            {en.moveMeal.dateLabel}
          </label>
          <input
            ref={dateInputRef}
            id="move-meal-date"
            type="date"
            value={targetDate}
            onChange={handleDateChange}
            autoFocus
            className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground font-mono text-base min-h-11 mb-6"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl py-4 text-sm font-semibold text-muted-foreground min-h-11"
            >
              {en.moveMeal.cancel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={sameDate || !targetDate}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-4 text-sm font-semibold disabled:opacity-25 active:scale-[0.98] min-h-11"
            >
              {en.moveMeal.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveMealSheet;
