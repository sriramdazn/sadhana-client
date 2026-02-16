import { TOTAL_POINTS_KEY } from "@/constants/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LogItem = { date: string; sadanaId: string };

export async function sadanaSyncPayload(args: { days: LogItem[] }) {
  const days = Array.isArray(args.days) ? args.days : [];
  const points = await AsyncStorage.getItem(TOTAL_POINTS_KEY);
  
  const map: Record<string, Set<string>> = {};
  for (const x of days) {
    if (!x?.date || !x?.sadanaId) continue;
    (map[x.date] ||= new Set()).add(x.sadanaId);
  }

  return {
    sadanas: Object.keys(map).map((date) => ({
      date,
      points,
      optedSadanas: Array.from(map[date]),
    })),
  };
}
