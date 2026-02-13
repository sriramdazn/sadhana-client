import { JourneyService, LogItem } from "@/components/types/types";
import { API_BASE_URL } from "@/constants/api.constant";
import { JOURNEY_KEY } from "@/constants/constant";
import { isoToDayLabel } from "@/utils/todayDate";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RemoteTrackerRow = {
  date: string; // "2026-02-13T00:00:00.000Z"
  optedSadanas?: string[];
};

type RemoteTrackerResponse = {
  data?: RemoteTrackerRow[];
};

function toYmd(dateStr: string) {
  if (!dateStr) return "";
  // handles "2026-02-13T00:00:00.000Z" => "2026-02-13"
  return dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr;
}

function flattenRemote(res: RemoteTrackerResponse): LogItem[] {
  const rows = Array.isArray(res?.data) ? res.data : [];
  const out: LogItem[] = [];

  const seen = new Set<string>();
  for (const row of rows) {
    const date = toYmd(row?.date || "");
    const ids = Array.isArray(row?.optedSadanas) ? row.optedSadanas : [];
    for (const sadanaId of ids) {
      const key = `${date}__${sadanaId}`;
      if (!date || !sadanaId || seen.has(key)) continue;
      seen.add(key);
      out.push({ date, sadanaId });
    }
  }

  // latest first
  out.sort((a, b) => b.date.localeCompare(a.date));
  return out;
}

// async function readLocalJourney(): Promise<LogItem[]> {
//   const raw = await AsyncStorage.getItem(JOURNEY_KEY);
//   if (!raw) return [];
//   try {
//     const parsed = JSON.parse(raw);
//     return Array.isArray(parsed) ? (parsed as LogItem[]) : [];
//   } catch {
//     return [];
//   }
// }

async function readLocalJourney(): Promise<LogItem[]> {
  const raw = await AsyncStorage.getItem(JOURNEY_KEY);
  if (!raw) return [];

  try {
    const parsed: any = JSON.parse(raw);
    // LogItem[]
    if (Array.isArray(parsed)) return parsed as LogItem[];
    // guest format: { days: [{ dayLabel, items: [{ sadhanaId }] }] }
    const days = parsed?.days;
    if (Array.isArray(days)) {
      const out: LogItem[] = [];

      for (const d of days) {
        const dayLabel = d?.dayLabel;
        const items = Array.isArray(d?.items) ? d.items : [];

        const iso = isoToDayLabel(dayLabel);
        for (const it of items) {
          const sadanaId = it?.sadhanaId;
          if (iso && sadanaId) out.push({ date: iso, sadanaId });
        }
      }
      // migrate to new format so future reads are fast
      await AsyncStorage.setItem(JOURNEY_KEY, JSON.stringify(out));
      return out;
    }

    return [];
  } catch {
    return [];
  }
}

async function writeLocalJourney(logs: LogItem[]) {
  await AsyncStorage.setItem(JOURNEY_KEY, JSON.stringify(logs));
}

async function apiJson<T>(url: string, method: string, token: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // backend often returns { code, message }
    let msg = `API error ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {
      const t = await res.text().catch(() => "");
      if (t) msg = t;
    }
    throw new Error(msg);
  }

  // some endpoints may return empty body
  const text = await res.text().catch(() => "");
  return (text ? (JSON.parse(text) as T) : (undefined as unknown as T));
}

function addLocal(prev: LogItem[], item: LogItem): LogItem[] {
  const exists = prev.some((x) => x.date === item.date && x.sadanaId === item.sadanaId);
  if (exists) return prev;
  return [item, ...prev].sort((a, b) => b.date.localeCompare(a.date));
}

function removeLocal(prev: LogItem[], item: LogItem): LogItem[] {
  return prev.filter((x) => !(x.date === item.date && x.sadanaId === item.sadanaId));
}

export function createJourneyService({
  isLoggedIn = false,
  accessToken = null,
}: JourneyService = {}) {
  const token = accessToken;
  const canUseRemote = isLoggedIn && !!token;
  
  return {
    async load(): Promise<LogItem[]> {
      if (canUseRemote) {
        const res = await apiJson<RemoteTrackerResponse>(
          `${API_BASE_URL}/v1/sadana-tracker`,
          "GET",
          token as string
        );
        return flattenRemote(res);
      }
      return readLocalJourney();
    },

    async addItem(item: LogItem): Promise<LogItem[]> {
      if (canUseRemote) {
        try {
          await apiJson(
            `${API_BASE_URL}/v1/sadana-tracker`,
            "POST",
            token as string,
            item // { date, sadanaId }
          );
        } catch (e: any) {
          // backend duplicate message => keep state, don't crash UI
          const msg = String(e?.message || "");
          if (!msg.includes("already opted")) throw e;
        }
        // reload
        return this.load();
      }

      const prev = await readLocalJourney();
      const next = addLocal(prev, item);
      await writeLocalJourney(next);
      return next;
    },

    async deleteItem(item: LogItem): Promise<LogItem[]> {
      if (canUseRemote) {
        await apiJson(
          `${API_BASE_URL}/v1/sadana-tracker`,
          "DELETE",
          token as string,
          item // { date, sadanaId }
        );
        return this.load();
      }

      const prev = await readLocalJourney();
      const next = removeLocal(prev, item);
      await writeLocalJourney(next);
      return next;
    },
  };
}
