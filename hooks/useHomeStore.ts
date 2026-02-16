import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { TOTAL_POINTS_KEY } from "@/constants/constant";
import { getUserPoints, addUserPoints } from "@/services/UserService";
const DEFAULT_POINTS = 350;
type Props = {
  isLoggedIn?: boolean;
  accessToken?: string | null;
};

export function useHomeStore({
  isLoggedIn = false,
  accessToken = null,
}: Props = {}) {
  const [points, setPoints] = useState<number>(DEFAULT_POINTS);
  const [loading, setLoading] = useState(true);
  const loadPoints = useCallback(async () => {
    setLoading(true);
    try {
      // Logged in 
      if (isLoggedIn) {
        if (!accessToken) return;
     const data = await getUserPoints(accessToken);
        if (data?.sadhanaPoints !== undefined) {
          setPoints(data.sadhanaPoints);

          await AsyncStorage.setItem(
            TOTAL_POINTS_KEY,
            String(data.sadhanaPoints)
          );
          return;
        }
      }
      //   Local
      const raw = await AsyncStorage.getItem(TOTAL_POINTS_KEY);
      if (raw) {
        const n = Number(raw);
        if (!Number.isNaN(n)) {
          setPoints(n);
          return;
        }
      }
      // fallback
      setPoints(DEFAULT_POINTS);
    } catch (err) {
      console.error("Load points failed", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // add points
  const addPoints = useCallback(
    async (amount: number, sadhanaId?: string, date?: string) => {
      const next = points + amount;

      // API sync
      if (isLoggedIn && sadhanaId && date) {
        if (!accessToken) return;
        await addUserPoints(accessToken, date, sadhanaId);
      }
      setPoints(next);
      await AsyncStorage.setItem(TOTAL_POINTS_KEY, String(next));
    },
    [points, isLoggedIn]
  );
  const subtractPoints = useCallback(
    async (amount: number) => {
      const next = Math.max(0, points - amount);
      setPoints(next);
      await AsyncStorage.setItem(TOTAL_POINTS_KEY, String(next));
    },
    [points]
  );

  useEffect(() => {
    loadPoints();
  }, [loadPoints]);

  return {
    points,
    loading,
    loadPoints,
    addPoints,
    subtractPoints,
  };
}