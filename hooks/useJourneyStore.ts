import { useCallback, useMemo, useState } from "react";
import { createJourneyService, type DayLogs, type LogItem } from "../services/journeyService";

type Args = {
  isLoggedIn?: boolean;
  accessToken?: string | null;
  apiBaseUrl?: string;
};

export function useJourneyStore({ isLoggedIn = false, accessToken = null, apiBaseUrl }: Args = {}) {
  const [days, setDays] = useState<DayLogs[]>([]);
  const [loading, setLoading] = useState(true);

  const journeyService = useMemo(() => {
    return createJourneyService({ isLoggedIn, accessToken, apiBaseUrl });
  }, [isLoggedIn, accessToken, apiBaseUrl]);

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
    async (dayLabel: string, item: LogItem) => {
      const next = await journeyService.addItem(dayLabel, item);
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
