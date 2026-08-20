import { useMemo } from "react";
import BottomNav from "./components/BottomNav";
import AddFoodSheet from "./components/sheets/AddFoodSheet";
import DayDetailSheet from "./components/sheets/DayDetailSheet";
import LogFoodSheet from "./components/sheets/LogFoodSheet";
import FridgeScreen from "./screens/FridgeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import SettingsScreen from "./screens/SettingsScreen";
import StatsScreen from "./screens/StatsScreen";
import TodayScreen from "./screens/TodayScreen";
import { useAppStore } from "./state/useAppStore";

const App = () => {
  const store = useAppStore();

  const todayEntries = useMemo(
    () => store.entries.filter((e) => e.date === store.today).sort((a, b) => a.ts - b.ts),
    [store.entries, store.today],
  );

  const editFoodModal = store.modal?.type === "edit-food" ? store.modal : null;

  if (!store.goals) {
    return <OnboardingScreen onComplete={store.setGoals} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 overflow-y-auto pb-24">
        {store.tab === "home" && (
          <TodayScreen
            goals={store.goals}
            entries={todayEntries}
            allEntries={store.entries}
            today={store.today}
            foods={store.foods}
            entryFocus={store.entryFocus}
            focusSeq={store.focusSeq}
            cardMode={store.cardMode}
            onCardModeChange={store.setCardMode}
            onAddFood={() => store.setTab("fridge")}
            onEditEntry={store.startEditEntry}
            onDeleteEntry={store.deleteEntry}
            onOpenSettings={store.openSettings}
          />
        )}
        {store.tab === "fridge" && (
          <FridgeScreen
            foods={store.foods}
            onSelectFood={(food) => store.openLogFood(food)}
            onAddNew={() => store.openModal({ type: "add-food" })}
            onEdit={(food) => store.openModal({ type: "edit-food", food })}
            onDuplicate={(food) =>
              store.openModal({
                type: "add-food",
                prefill: { ...food, name: `${food.name} (copy)`, isDefault: false },
              })
            }
            onDelete={store.deleteFood}
          />
        )}
        {store.tab === "history" && (
          <HistoryScreen
            allEntries={store.entries}
            goals={store.goals}
            today={store.today}
            onSelectDay={(date) => store.openModal({ type: "day-detail", date })}
          />
        )}
        {store.tab === "stats" && (
          <StatsScreen allEntries={store.entries} goals={store.goals} today={store.today} />
        )}
      </div>

      <BottomNav tab={store.tab} onTabChange={store.setTab} />

      {store.settingsOpen && (
        <SettingsScreen
          goals={store.goals}
          onSave={store.setGoals}
          onCancel={store.closeSettings}
        />
      )}

      {store.modal?.type === "log-food" && (
        <LogFoodSheet
          food={store.modal.food}
          prefill={store.editingEntry}
          onConfirm={store.logOrUpdateEntry}
          onClose={store.closeModal}
        />
      )}
      {store.modal?.type === "add-food" && (
        <AddFoodSheet
          mode="add"
          prefill={store.modal.prefill}
          onConfirm={store.addFood}
          onClose={store.closeModal}
        />
      )}
      {editFoodModal && (
        <AddFoodSheet
          mode="edit"
          prefill={editFoodModal.food}
          onConfirm={(patch) => store.updateFood(editFoodModal.food.id, patch)}
          onClose={store.closeModal}
        />
      )}
      {store.modal?.type === "day-detail" && (
        <DayDetailSheet
          date={store.modal.date}
          entries={store.entries
            .filter((e) => e.date === (store.modal && store.modal.type === "day-detail" ? store.modal.date : ""))
            .sort((a, b) => a.ts - b.ts)}
          foods={store.foods}
          goals={store.goals}
          onClose={store.closeModal}
        />
      )}
    </div>
  );
};

export default App;
