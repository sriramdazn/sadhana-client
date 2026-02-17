import { todayIso } from "./todayDate";

export type CompletedByDate = Record<string, Record<string, number>>;

export function migrateCompletedStorageToDailyCounts(raw: any): CompletedByDate {
  if (!raw || typeof raw !== "object") return {};

  const topKeys = Object.keys(raw);
  // Old shape: { [sadanaId]: true } (assumed for today)
  const looksLikeOld = topKeys.length > 0 && !topKeys[0]?.includes("-");
  if (looksLikeOld) {
    const dayMap: Record<string, number> = {};
    for (const k of topKeys) {
      if (raw[k]) dayMap[k] = 1;
    }
    return { [todayIso()]: dayMap };
  }

  const out: CompletedByDate = {};
  for (const dateIso of topKeys) {
    const v = raw[dateIso];
    if (!v || typeof v !== "object") continue;
    const dayMap: Record<string, number> = {};
    for (const sadanaId of Object.keys(v)) {
      const n = v[sadanaId];
      if (typeof n === "number") {
        if (n > 0) dayMap[sadanaId] = Math.max(0, n);
      } else if (typeof n === "boolean") {
        if (n) dayMap[sadanaId] = 1;
      }
    }
    if (Object.keys(dayMap).length) out[dateIso] = dayMap;
  }
  return out;
}