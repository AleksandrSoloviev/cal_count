import type { Entry, Food, Meal } from "../domain/types";
import EntryRow from "./EntryRow";
import MealAccordion from "./MealAccordion";

type Props = {
  meals: Meal[];
  foods: Food[];
  expandedIndex: number | null;
  idPrefix?: string;
  onToggle: (index: number) => void;
  onEdit?: (entry: Entry) => void;
  onDelete?: (id: string) => void;
  onMove?: (meal: Meal) => void;
};

const MealList = ({
  meals,
  foods,
  expandedIndex,
  idPrefix = "meal",
  onToggle,
  onEdit,
  onDelete,
  onMove,
}: Props) => {
  const readOnly = !onEdit && !onDelete;

  const handleToggle = (index: number) => {
    onToggle(index);
  };

  return (
    <div className="space-y-3">
      {meals.map((meal, index) => {
        const expanded = expandedIndex === index;
        const panelId = `${idPrefix}-panel-${meal.index}`;
        return (
          <MealAccordion
            key={`${idPrefix}-${meal.index}`}
            meal={meal}
            expanded={expanded}
            panelId={panelId}
            onToggle={() => handleToggle(index)}
            onMove={onMove ? () => onMove(meal) : undefined}
          >
            {meal.entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                foods={foods}
                readOnly={readOnly}
                onEdit={onEdit ? () => onEdit(entry) : undefined}
                onDelete={onDelete ? () => onDelete(entry.id) : undefined}
              />
            ))}
          </MealAccordion>
        );
      })}
    </div>
  );
};

export default MealList;
