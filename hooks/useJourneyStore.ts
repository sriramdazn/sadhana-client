import { useCallback, useMemo, useRef, useState } from "react";
import { createJourneyService } from "@services/journeyService";
import { JourneyService, SadhanaLogs } from "@/components/types/types";

const PAGE_SIZE = 10;
// const TTL_MS = 60_000;
let journeyCacheTime = 0;
let journeyCacheData: SadhanaLogs[] = [];
let journeyCacheHasMore = true;
let journeyCachePage = 1;

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
      if (!opts?.force && journeyCacheTime !== 0 && journeyCacheData.length > 0) {
        cachedDaysRef.current = journeyCacheData;
        cachedHasMoreRef.current = journeyCacheHasMore;
        currentPageRef.current = journeyCachePage;
  
        setDays(journeyCacheData);
        setHasMore(journeyCacheHasMore);
        return;
      }
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);
      try {
        const { items, hasMore: more } = await journeyService.loadPage(1, PAGE_SIZE);
  
        // Save globally
        journeyCacheTime = Date.now();
        journeyCacheData = items;
        journeyCacheHasMore = more;
        journeyCachePage = 1;
  
        // Save locally
        cachedDaysRef.current = items;
        cachedHasMoreRef.current = more;
        currentPageRef.current = 1;
  
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
  
      const { items, hasMore: more } =
        await journeyService.loadPage(nextPage, PAGE_SIZE);
  
      const merged = [...cachedDaysRef.current, ...items];
      currentPageRef.current = nextPage;
      cachedDaysRef.current = merged;
      cachedHasMoreRef.current = more;
      journeyCacheData = merged;
      journeyCacheHasMore = more;
      journeyCachePage = nextPage;
      journeyCacheTime = Date.now();
      setDays(merged);
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
  
        const firstPage = all.slice(0, PAGE_SIZE);
        const more = all.length > PAGE_SIZE;
        currentPageRef.current = 1;
        cachedDaysRef.current = firstPage;
        cachedHasMoreRef.current = more;

        journeyCacheData = firstPage;
        journeyCacheHasMore = more;
        journeyCachePage = 1;
        journeyCacheTime = Date.now();
  
        setDays(firstPage);
        setHasMore(more);
  
        return all;
      } catch (e) {
        console.log("Journey.addItem error:", e);
        throw e;
      }
    },
    [journeyService]
  );
  

  const deleteItem = useCallback(
    async (item: SadhanaLogs) => {
      const all = await journeyService.deleteItem(item);
  
      const firstPage = all.slice(0, PAGE_SIZE);
      const more = all.length > PAGE_SIZE;
  
      currentPageRef.current = 1;
  
      cachedDaysRef.current = firstPage;
      cachedHasMoreRef.current = more;
  
      journeyCacheData = firstPage;
      journeyCacheHasMore = more;
      journeyCachePage = 1;
      journeyCacheTime = Date.now();
  
      setDays(firstPage);
      setHasMore(more);
  
      return all;
    },
    [journeyService]
  );

  return { days, loading, load, loadNextPage, addItem, deleteItem, hasMore };
}

export function clearJourneyCache() {
  journeyCacheTime = 0;
  journeyCacheData = [];
  journeyCacheHasMore = true;
  journeyCachePage = 1;
}
