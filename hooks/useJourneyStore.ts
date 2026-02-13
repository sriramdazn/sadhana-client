import { useCallback, useMemo, useState } from "react";
import { createJourneyService } from "@services/journeyService";
import { JourneyService, LogItem } from "@/components/types/types";

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
      const next = await journeyService.load();
      setDays(next);
    } catch (e) {
      console.log("Journey.load error:", e);
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, [journeyService]);

  const addItem = useCallback(
    async (item: LogItem) => {
      // quick duplicate guard
      if (days.some((x) => x.date === item.date && x.sadanaId === item.sadanaId)) return days;
      const next = await journeyService.addItem(item);
      setDays(next);
      return next;
    },
    [journeyService, days]
  );

  const deleteItem = useCallback(
    async (item: LogItem) => {
      const next = await journeyService.deleteItem(item);
      setDays(next);
      return next;
    },
    [journeyService]
  );

  return { days, loading, load, addItem, deleteItem };
}
