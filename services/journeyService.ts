import { JourneyService } from "@/app/features/sadhana/types";
import { API_BASE_URL } from "@/constants/api.constant";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type LogItem = { id: string; title: string; points: number };
export type DayLogs = { dayLabel: string; items: LogItem[] };

const JOURNEY_KEY = "sadhana_journey_v1";

async function readLocalJourney(): Promise<DayLogs[]> {
  const raw = await AsyncStorage.getItem(JOURNEY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DayLogs[];
  } catch {
    return [];
  }
}

async function writeLocalJourney(days: DayLogs[]) {
  await AsyncStorage.setItem(JOURNEY_KEY, JSON.stringify(days));
}

async function api<T>(url: string, method: string, token: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `API error ${res.status}`);
  }

  return (await res.json()) as T;
}

function addLocalItem(prev: DayLogs[], dayLabel: string, item: LogItem): DayLogs[] {
  const found = prev.find((d) => d.dayLabel === dayLabel);
  if (!found) return [{ dayLabel, items: [item] }, ...prev];

  return prev.map((d) => (d.dayLabel === dayLabel ? { ...d, items: [item, ...d.items] } : d));
}

function deleteLocalItem(prev: DayLogs[], dayLabel: string, itemId: string): DayLogs[] {
  return prev
    .map((d) =>
      d.dayLabel === dayLabel ? { ...d, items: d.items.filter((x) => x.id !== itemId) } : d
    )
    .filter((d) => d.items.length > 0);
}

export function createJourneyService({
  isLoggedIn = false,
  accessToken = null,
}: JourneyService = {}) {
  const canUseRemote = isLoggedIn && !!accessToken && !!API_BASE_URL;

  return {
    async load(): Promise<DayLogs[]> {
      if (canUseRemote) {
        return api<DayLogs[]>(`${API_BASE_URL}/v1/journey`, "GET", accessToken as string);
      }
      return readLocalJourney();
    },

    async addItem(dayLabel: string, item: LogItem): Promise<DayLogs[]> {
      if (canUseRemote) {
        return api<DayLogs[]>(
          `${API_BASE_URL}/v1/journey/item`,
          "POST",
          accessToken as string,
          { dayLabel, item }
        );
      }

      const prev = await readLocalJourney();
      const next = addLocalItem(prev, dayLabel, item);
      await writeLocalJourney(next);
      return next;
    },

    async deleteItem(dayLabel: string, itemId: string): Promise<DayLogs[]> {
      if (canUseRemote) {
        return api<DayLogs[]>(
          `${API_BASE_URL}/v1/journey/item`,
          "DELETE",
          accessToken as string,
          { dayLabel, itemId }
        );
      }

      const prev = await readLocalJourney();
      const next = deleteLocalItem(prev, dayLabel, itemId);
      await writeLocalJourney(next);
      return next;
    },
  };
}
