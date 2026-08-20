import { useCallback, useEffect, useMemo, useState } from "react";
import { msUntilNextLocalMidnight, todayStr } from "../domain/dates";
import { foodFromEntry } from "../domain/foodFromEntry";
import { groupEntriesIntoMeals } from "../domain/meals";
import { calcNutrition } from "../domain/nutrition";
import type { CardMode, Entry, EntryFocus, Food, Goals, Modal, Tab } from "../domain/types";
import { applyFoodUpdate, type FoodPatch } from "../domain/updateFood";
import { loadDocument, saveDocument } from "../storage/localStore";

const newId = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useAppStore = () => {
  const initial = useMemo(() => loadDocument(), []);
  const [goals, setGoalsState] = useState<Goals | null>(initial.goals);
  const [foods, setFoods] = useState<Food[]>(initial.foods);
  const [entries, setEntries] = useState<Entry[]>(initial.entries);
  const [tab, setTab] = useState<Tab>("home");
  const [modal, setModal] = useState<Modal | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [today, setToday] = useState(() => todayStr());
  const [entryFocus, setEntryFocus] = useState<EntryFocus>({ kind: "latest" });
  const [focusSeq, setFocusSeq] = useState(0);
  const [cardMode, setCardMode] = useState<CardMode>("day");

  const persist = useCallback(
    (next: { goals?: Goals | null; foods?: Food[]; entries?: Entry[] }) => {
      const doc = {
        version: 1,
        goals: next.goals !== undefined ? next.goals : goals,
        foods: next.foods ?? foods,
        entries: next.entries ?? entries,
      };
      saveDocument(doc);
    },
    [goals, foods, entries],
  );

  const syncToday = useCallback(() => {
    setToday(todayStr());
  }, []);

  useEffect(() => {
    let timeoutId = 0;
    const schedule = () => {
      const ms = msUntilNextLocalMidnight();
      timeoutId = window.setTimeout(() => {
        syncToday();
        schedule();
      }, ms + 50);
    };
    schedule();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") syncToday();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", syncToday);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", syncToday);
    };
  }, [syncToday]);

  const setGoals = (g: Goals) => {
    setGoalsState(g);
    persist({ goals: g });
    setSettingsOpen(false);
  };

  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  const openModal = (m: Modal) => {
    if (m.type !== "log-food") setEditingEntry(null);
    setModal(m);
  };

  const openLogFood = (food: Food, entry: Entry | null = null) => {
    setEditingEntry(entry);
    setModal({ type: "log-food", food });
  };

  const closeModal = () => {
    setModal(null);
    setEditingEntry(null);
  };

  const logOrUpdateEntry = (food: Food, qty?: number, compQty?: Record<string, number>) => {
    const nutrition = calcNutrition(food, qty, compQty);
    const liveDate = todayStr();
    let date = liveDate;
    if (editingEntry) {
      date =
        editingEntry.date === today || editingEntry.date === liveDate
          ? liveDate
          : editingEntry.date;
    }
    const entry: Entry = {
      id: editingEntry?.id ?? newId(),
      date,
      ts: editingEntry?.ts ?? Date.now(),
      foodId: food.id,
      foodName: food.name,
      method: food.method,
      qty,
      compQty,
      nutrition,
    };
    const nextEntries = editingEntry
      ? entries.map((e) => (e.id === editingEntry.id ? entry : e))
      : [...entries, entry];
    const foodInLibrary = foods.some((f) => f.id === food.id);
    const nextFoods = foodInLibrary
      ? foods.map((f) => (f.id === food.id ? { ...f, lastUsed: Date.now() } : f))
      : foods;
    setEntries(nextEntries);
    setFoods(nextFoods);
    persist({ entries: nextEntries, foods: nextFoods });
    setEntryFocus({ kind: "entry", id: entry.id });
    setFocusSeq((n) => n + 1);
    closeModal();
    setTab("home");
  };

  const deleteEntry = (id: string) => {
    const target = entries.find((e) => e.id === id);
    if (target) {
      const dayMeals = groupEntriesIntoMeals(entries.filter((e) => e.date === target.date));
      const meal = dayMeals.find((m) => m.entries.some((e) => e.id === id));
      const remainingIds = meal ? meal.entries.filter((e) => e.id !== id).map((e) => e.id) : [];
      setEntryFocus(
        remainingIds.length > 0 ? { kind: "remaining", ids: remainingIds } : { kind: "latest" },
      );
      setFocusSeq((n) => n + 1);
    }
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    persist({ entries: next });
  };

  const startEditEntry = (entry: Entry) => {
    const food = foods.find((f) => f.id === entry.foodId) ?? foodFromEntry(entry);
    openLogFood(food, entry);
  };

  const addFood = (food: Omit<Food, "id" | "isDefault">) => {
    const next = [...foods, { ...food, id: newId(), isDefault: false }];
    setFoods(next);
    persist({ foods: next });
    closeModal();
  };

  const deleteFood = (id: string) => {
    const target = foods.find((f) => f.id === id);
    if (!target || target.isDefault) return;
    const next = foods.filter((f) => f.id !== id);
    setFoods(next);
    persist({ foods: next });
  };

  const updateFood = (id: string, patch: FoodPatch) => {
    const next = applyFoodUpdate(foods, id, patch);
    if (next === foods) return;
    setFoods(next);
    persist({ foods: next });
    closeModal();
  };

  const sortedFoods = useMemo(
    () => [...foods].sort((a, b) => (b.lastUsed ?? 0) - (a.lastUsed ?? 0)),
    [foods],
  );

  return {
    goals,
    setGoals,
    foods: sortedFoods,
    entries,
    tab,
    setTab,
    modal,
    openModal,
    openLogFood,
    closeModal,
    settingsOpen,
    openSettings,
    closeSettings,
    editingEntry,
    today,
    entryFocus,
    focusSeq,
    cardMode,
    setCardMode,
    logOrUpdateEntry,
    deleteEntry,
    startEditEntry,
    addFood,
    updateFood,
    deleteFood,
  };
};
