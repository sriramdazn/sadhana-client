import { useCallback, useMemo, useState } from "react";
import { createJourneyService } from "@services/journeyService"; // or "@/services/journeyService"
import { JourneyService, LogItem } from "@/components/types/types";

function normalizeLogs(v: any): LogItem[] {
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.logs)) return v.logs;
  if (v && Array.isArray(v.days)) return v.days;
  if (v && Array.isArray(v.data)) return v.data;
  return [];
}

export function useJourneyStore({
  isLoggedIn = false,
  accessToken = null,
}: JourneyService = {}) {
  const [days, setDays] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const journeyService = useMemo(
    () => createJourneyService({ isLoggedIn, accessToken }),
    [isLoggedIn, accessToken]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await journeyService.load();
      const next = normalizeLogs(res);
      console.log("Journey.load() ->", next);
      setDays(next);
    } catch (e) {
      console.log("Journey.load error:", e);
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, [journeyService]);

  // const addItem = useCallback(
  //   async (item: LogItem) => {
  //     const res = await journeyService.addItem(item);
  //     const next = normalizeLogs(res);
  //     setDays(next);
  //     return next;
  //   },
  //   [journeyService]
  // );

  const addItem = useCallback(
    async (item: LogItem) => {
      // prevent duplicate
      const exists = days.some((x) => x.date === item.date && x.sadanaId === item.sadanaId);
      if (exists) return days;
      try {
        const res = await journeyService.addItem(item);
        const next = normalizeLogs(res);
        setDays(next);
        return next;
      } catch (e: any) {
        const msg = String(e?.message || "");
  
        // from backend if already opted, just keep local state as
        if (msg.includes("Sadana already opted")) {
          return days;
        }
  
        throw e;
      }
    },
    [journeyService, days]
  );
  

  const deleteItem = useCallback(
    async (item: LogItem) => {
      const res = await journeyService.deleteItem(item);
      const next = normalizeLogs(res);
      setDays(next);
      return next;
    },
    [journeyService]
  );

  return { days, loading, load, addItem, deleteItem };
}
