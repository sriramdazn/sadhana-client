import { useCallback, useMemo, useRef, useState } from "react";
import { createJourneyService } from "@services/journeyService";
import { JourneyService, SadhanaLogs } from "@/components/types/types";

const PAGE_SIZE = 10;
const TTL_MS = 60_000;

export function useJourneyStore({ isLoggedIn = false, accessToken = null }: JourneyService = {}) {
  const [days, setDays] = useState<SadhanaLogs[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const currentPageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const lastLoadedAtRef = useRef(0);
  const cachedDaysRef = useRef<SadhanaLogs[]>([]);
  const cachedHasMoreRef = useRef(true);

  const journeyService = useMemo(
    () => createJourneyService({ isLoggedIn, accessToken }),
    [isLoggedIn, accessToken]
  );

  const load = useCallback(
    async (opts?: { force?: boolean }) => {
      const now = Date.now();
      const isStale = now - lastLoadedAtRef.current >= TTL_MS;

      if (!opts?.force && !isStale && cachedDaysRef.current.length > 0) {
        setDays(cachedDaysRef.current);
        setHasMore(cachedHasMoreRef.current);
        return;
      }

      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);

      try {
        const { items, hasMore: more } = await journeyService.loadPage(1, PAGE_SIZE);

        cachedDaysRef.current = items;
        cachedHasMoreRef.current = more;
        currentPageRef.current = 1;
        lastLoadedAtRef.current = Date.now();

        setDays(items);
        setHasMore(more);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [journeyService]
  );

  const loadNextPage = useCallback(async () => {
    if (isFetchingRef.current || !cachedHasMoreRef.current) return;
    isFetchingRef.current = true;

    try {
      const nextPage = currentPageRef.current + 1;
      const { items, hasMore: more } = await journeyService.loadPage(nextPage, PAGE_SIZE);
      currentPageRef.current = nextPage;
      cachedDaysRef.current = [...cachedDaysRef.current, ...items];
      cachedHasMoreRef.current = more;

      setDays((prev) => [...prev, ...items]);
      setHasMore(more);
    } finally {
      isFetchingRef.current = false;
    }
  }, [journeyService]);
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
      try {
        const all = await journeyService.addItem(item);
        lastLoadedAtRef.current = 0;
        cachedDaysRef.current = [];
        await load({ force: true });
        return all;
      } catch (e) {
        console.log("Journey.addItem error:", e);
        throw e;
      }
    },
    [journeyService, load]
  );

  const deleteItem = useCallback(
    async (item: SadhanaLogs) => {
      const result = await journeyService.deleteItem(item);

      const filter = (list: SadhanaLogs[]) =>
        list.filter(
          (x) => !(x.dateTime === item.dateTime && x.sadanaId === item.sadanaId)
        );

      cachedDaysRef.current = filter(cachedDaysRef.current);
      setDays((prev) => filter(prev));
      lastLoadedAtRef.current = 0;
      return result;
    },
    [journeyService]
  );

  return { days, loading, load, loadNextPage, addItem, deleteItem, hasMore };
}
