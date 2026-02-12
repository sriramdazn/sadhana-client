import { JourneyService, LogItem } from "@/components/types/types";
import { API_BASE_URL } from "@/constants/api.constant";
import { JOURNEY_KEY } from "@/constants/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function readLocalJourney(): Promise<LogItem[]> {
  const raw = await AsyncStorage.getItem(JOURNEY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LogItem[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalJourney(logs: LogItem[]) {
  await AsyncStorage.setItem(JOURNEY_KEY, JSON.stringify(logs));
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

  const text = await res.text().catch(() => "");
  return (text ? (JSON.parse(text) as T) : ([] as unknown as T));
}

function addLocalLog(prev: LogItem[], item: LogItem): LogItem[] {
  // prevent duplicates for same date + sadanaId
  const exists = prev.some((x) => x.date === item.date && x.sadanaId === item.sadanaId);
  if (exists) return prev;

  return [item, ...prev];
}

function deleteLocalLog(prev: LogItem[], item: LogItem): LogItem[] {
  return prev.filter((x) => !(x.date === item.date && x.sadanaId === item.sadanaId));
}

export function createJourneyService({
  isLoggedIn = false,
  accessToken = null,
}: JourneyService = {}) {
  const authToken = accessToken;
  const canUseRemote = isLoggedIn && !!authToken;

  // should print true after login
  console.log("Journey API?", canUseRemote, { isLoggedIn, hasToken: !!authToken });

  return {
    async load(): Promise<LogItem[]> {
      if (canUseRemote) {
        // backend should return LogItem[]
        return api<LogItem[]>(`${API_BASE_URL}/v1/sadana-tracker`, "GET", authToken as string);
      }
      return readLocalJourney();
    },

    async addItem(item: LogItem): Promise<LogItem[]> {
      if (canUseRemote) {
        // payload must be: { date, sadanaId }
        return api<LogItem[]>(
          `${API_BASE_URL}/v1/sadana-tracker`,
          "POST",
          authToken as string,
          item
        );
      }

      const prev = await readLocalJourney();
      const next = addLocalLog(prev, item);
      await writeLocalJourney(next);
      return next;
    },

    async deleteItem(item: LogItem): Promise<LogItem[]> {
      if (canUseRemote) {
        // If your backend expects DELETE body, keep it like this:
        return api<LogItem[]>(
          `${API_BASE_URL}/v1/sadana-tracker`,
          "DELETE",
          authToken as string,
          item
        );
      }

      const prev = await readLocalJourney();
      const next = deleteLocalLog(prev, item);
      await writeLocalJourney(next);
      return next;
    },
  };
}
