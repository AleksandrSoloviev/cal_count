export const todayStr = (now = new Date()): string => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const dateOffset = (daysAgo: number, now = new Date()): string => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return todayStr(d);
};

export const fmtDate = (dateStr: string): string => {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

export const fmtTime = (ts: number): string =>
  new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export const greetingForHour = (hour: number): "morning" | "afternoon" | "evening" => {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

export const msUntilNextLocalMidnight = (now = new Date()): number => {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};
