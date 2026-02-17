import { useCallback, useMemo, useRef, useState } from "react";
import { createJourneyService } from "@services/journeyService";
import { JourneyService, SadhanaLogs } from "@/components/types/types";

export function useJourneyStore({ isLoggedIn = false, accessToken = null }: JourneyService = {}) {
  const [days, setDays] = useState<SadhanaLogs[]>([]);
  const [loading, setLoading] = useState(false);

  const journeyService = useMemo(
    () => createJourneyService({ isLoggedIn, accessToken }),
    [isLoggedIn, accessToken]
  );
  const lastLoadedAtRef = useRef(0);

  const load = useCallback(async (opts?: { force?: boolean }) => {
    const now = Date.now();
    const ttlMs = 30_000;
    if (!opts?.force && now - lastLoadedAtRef.current < ttlMs) {
      return days; 
    }
    setLoading(true);
    try {
      const next = await journeyService.load();
      setDays(next);
      lastLoadedAtRef.current = now;
      return next;
    } finally {
      setLoading(false);
    }
  }, [journeyService, days]);

  // const load = useCallback(
  //   async () => { 
  //     setLoading(true);
  //     try {
  //       const next = await journeyService.load();
  //       setDays(next);
  //     } catch (e) {
  //       console.log("Journey.load error:", e);
  //       setDays([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [journeyService]
  // );

  const addItem = useCallback(
    async (item: SadhanaLogs): Promise<SadhanaLogs[]> => {
      const existingCount = days.filter(
        (x) => x.dateTime === item.dateTime && x.sadanaId === item.sadanaId
      ).length;
      if (existingCount >= 2) return days;
  
      try {
        const next = await journeyService.addItem(item);
        setDays(next);
        lastLoadedAtRef.current = 0; 
        return next;
      } catch (e) {
        console.log("Journey.addItem error:", e);
        throw e;
      }
    },
    [journeyService, days]
  );
  

  const deleteItem = useCallback(
    async (item: SadhanaLogs) => {
      const next = await journeyService.deleteItem(item);
      setDays(next);
      lastLoadedAtRef.current = 0; 
      return next;
    },
    [journeyService]
  );

  return { days, loading, load, addItem, deleteItem };
}
