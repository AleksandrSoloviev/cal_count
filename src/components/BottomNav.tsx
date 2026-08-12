import type { ReactNode } from "react";
import { CalendarDays, Refrigerator as FridgeIcon, TrendingUp, UtensilsCrossed } from "lucide-react";
import type { Tab } from "../domain/types";
import en from "../i18n/en";

type Props = {
  tab: Tab;
  onTabChange: (t: Tab) => void;
};

const BottomNav = ({ tab, onTabChange }: Props) => {
  const items: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "home", label: en.nav.today, icon: <UtensilsCrossed size={20} aria-hidden /> },
    { id: "fridge", label: en.nav.fridge, icon: <FridgeIcon size={20} aria-hidden /> },
    { id: "history", label: en.nav.history, icon: <CalendarDays size={20} aria-hidden /> },
    { id: "stats", label: en.nav.stats, icon: <TrendingUp size={20} aria-hidden /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40" aria-label="Primary">
      <div className="bg-card/95 backdrop-blur-md border-t border-border max-w-md mx-auto">
        <div className="flex">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              aria-current={tab === item.id ? "page" : undefined}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 min-h-11 transition-colors ${
                tab === item.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="h-safe-area-inset-bottom" />
      </div>
    </nav>
  );
};

export default BottomNav;
