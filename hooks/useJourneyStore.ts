import { useCallback, useMemo, useState } from "react";
import { createJourneyService } from "@services/journeyService";
import { DayLogs, JourneyService, LogItem } from "@/components/types/types";

export function useJourneyStore({
  isLoggedIn = false,
  accessToken = null,
}: JourneyService = {}) {
  const [days, setDays] = useState<DayLogs[]>([]);
  const [loading, setLoading] = useState(true);

  const journeyService = useMemo(
    () => 
      createJourneyService({ isLoggedIn, accessToken }),
    [isLoggedIn, accessToken]
  );
  
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await journeyService.load();
      setDays(next);
    } finally {
      setLoading(false);
    }
  }, [journeyService]);

  const addItem = useCallback(
    async (item: LogItem) => {
      const next = await journeyService.addItem(item);
      setDays(next);
    },
    [journeyService]
  );

  const deleteItem = useCallback(
    async (dayLabel: string, itemId: string) => {
      const next = await journeyService.deleteItem(dayLabel, itemId);
      setDays(next);
    },
    [journeyService]
  );

  return { days, loading, load, addItem, deleteItem };
}
