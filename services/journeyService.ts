import { JourneyService, RemoteTrackerResponse, SadhanaLogs } from "@/components/types/types";
import { API_BASE_URL } from "@/constants/api.constant";
import { JOURNEY_KEY } from "@/constants/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JOURNEY_EXTRAS_KEY = `${JOURNEY_KEY}:extras`;

export function createJourneyService({
  isLoggedIn = false,
  accessToken = null,
}: JourneyService = {}) {
  const token = accessToken;
  const canUseRemote = isLoggedIn && !!token;

  async function loadRemotePage(page: number, limit: number): Promise<{
    items: SadhanaLogs[];
    totalPages: number;
    totalResults: number;
  }> {
    const res = await apiJson<RemoteTrackerResponse>(
      `${API_BASE_URL}/v1/sadana-tracker?page=${page}&limit=${limit}`,
      "GET",
      token as string
    );

    return {
      items: flattenRemote(res),
      totalPages: (res as any)?.totalPages ?? 1,
      totalResults: (res as any)?.totalResults ?? 0,
    };
  }

  async function loadRemoteAll(): Promise<SadhanaLogs[]> {
    const first = await loadRemotePage(1, 100);
    if (first.totalPages <= 1) return first.items;

    const rest = await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, i) => loadRemotePage(i + 2, 100))
    );
    return [first.items, ...rest.map((r) => r.items)].flat();
  }

  return {
    async loadPage(page: number, limit: number): Promise<{
      items: SadhanaLogs[];
      totalPages: number;
      hasMore: boolean;
    }> {
      if (canUseRemote) {
        try {
          const extras = await readExtras();
          const { items: remote, totalPages } = await loadRemotePage(page, limit);

          const combined =
            page === 1 ? mergeLogs(remote, extras) : remote;

          return { items: combined, totalPages, hasMore: page < totalPages };
        } catch {
          const cached = await readLocalJourney();
          const start = (page - 1) * limit;
          const slice = cached.slice(start, start + limit);
          return {
            items: slice,
            totalPages: Math.ceil(cached.length / limit),
            hasMore: start + limit < cached.length,
          };
        }
      }

      const cached = await readLocalJourney();
      const start = (page - 1) * limit;
      const slice = cached.slice(start, start + limit);
      return {
        items: slice,
        totalPages: Math.ceil(cached.length / limit),
        hasMore: start + limit < cached.length,
      };
    },

    async load(): Promise<SadhanaLogs[]> {
      const cached = await readLocalJourney();
      if (canUseRemote) {
        try {
          const [remote, extras] = await Promise.all([loadRemoteAll(), readExtras()]);
          const merged = mergeLogs(remote, extras);
          await writeLocalJourney(merged);
          return merged;
        } catch {
          return cached;
        }
      }
      return cached;
    },

    async addItem(item: SadhanaLogs): Promise<SadhanaLogs[]> {
      const normalized = normalizeLogItem(item);

      if (canUseRemote) {
        const extras = await readExtras();

        try {
          await apiJson(
            `${API_BASE_URL}/v1/sadana-tracker`,
            "POST",
            token as string,
            normalized
          );
          const freshRemote = await loadRemoteAll();
          const merged = mergeLogs(freshRemote, extras);
          await writeLocalJourney(merged);
          return merged;
        } catch (e: any) {
          if (isAlreadyOptedError(e)) {
            const nextExtras = addLocalWithCap(extras, normalized, 1);
            await writeExtras(nextExtras);
            try {
              const remote = await loadRemoteAll();
              const merged = mergeLogs(remote, nextExtras);
              await writeLocalJourney(merged);
              return merged;
            } catch {
              return mergeLogs([], nextExtras);
            }
          }
          throw e;
        }
      }

      const prev = await readLocalJourney();
      const next = addLocalWithCap(prev, normalized, 2);
      await writeLocalJourney(next);
      return next;
    },

    async deleteItem(item: SadhanaLogs): Promise<SadhanaLogs[]> {
      const normalized = normalizeLogItem(item);

      if (canUseRemote) {
        const [remote, extras] = await Promise.all([loadRemoteAll(), readExtras()]);

        const extraIdx = extras.findIndex(
          (x) => x.dateTime === normalized.dateTime && x.sadanaId === normalized.sadanaId
        );
        if (extraIdx >= 0) {
          const nextExtras = extras.slice();
          nextExtras.splice(extraIdx, 1);
          await writeExtras(nextExtras);
          return mergeLogs(remote, nextExtras);
        }

        await apiJson(
          `${API_BASE_URL}/v1/sadana-tracker`,
          "DELETE",
          token as string,
          normalized
        );

        const freshRemote = await loadRemoteAll();
        return mergeLogs(freshRemote, extras);
      }

      const prev = await readLocalJourney();
      const next = removeOne(prev, normalized);
      await writeLocalJourney(next);
      return next;
    },
  };
}

function normalizeLogItem(item: SadhanaLogs): SadhanaLogs {
  return { dateTime: item?.dateTime || "", sadanaId: item?.sadanaId || "" };
}

function mergeLogs(remote: SadhanaLogs[], extras: SadhanaLogs[]) {
  const merged = [...remote, ...extras]
    .map(normalizeLogItem)
    .filter((x) => x.dateTime && x.sadanaId);
  merged.sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  return merged;
}

function flattenRemote(res: any): SadhanaLogs[] {
  const rows =
    (Array.isArray(res?.results) && res.results) ||
    (Array.isArray(res?.data) && res.data) ||
    [];
  const out: SadhanaLogs[] = [];
  for (const row of rows) {
    const dayDate = row?.date || "";
    const opted = Array.isArray(row?.optedSadanas) ? row.optedSadanas : [];
    for (const it of opted) {
      if (it && typeof it === "object") {
        const sadanaId = it?.sadana || it?.sadanaId || "";
        const dateTime = it?.dateTime || dayDate || "";
        if (!sadanaId || !dateTime) continue;
        out.push({ sadanaId, dateTime } as any);
      } else {
        const sadanaId = String(it || "");
        const dateTime = dayDate;
        if (!sadanaId || !dateTime) continue;
        out.push({ sadanaId, dateTime } as any);
      }
    }
  }
  out.sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  return out;
}

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function readLocalJourney(): Promise<SadhanaLogs[]> {
  const parsed = await readJson<any>(JOURNEY_KEY);
  if (!parsed) return [];

  if (Array.isArray(parsed)) {
    return (parsed as SadhanaLogs[])
      .map(normalizeLogItem)
      .filter((x) => x.dateTime && x.sadanaId)
      .sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  }

  if (parsed?.days && Array.isArray(parsed.days)) {
    const out: SadhanaLogs[] = [];
    for (const d of parsed.days) {
      const dateTime = d?.dayLabel;
      if (!dateTime) continue;
      const items = Array.isArray(d?.items) ? d.items : [];
      for (const it of items) {
        const sadanaId = it?.sadanaId || it?.id;
        if (!sadanaId) continue;
        out.push({ dateTime, sadanaId });
      }
    }
    const normalized = out
      .map(normalizeLogItem)
      .filter((x) => x.dateTime && x.sadanaId)
      .sort((a, b) => b.dateTime.localeCompare(a.dateTime));
    await writeJson(JOURNEY_KEY, normalized);
    return normalized;
  }

  return [];
}

async function writeLocalJourney(logs: SadhanaLogs[]) {
  await writeJson(JOURNEY_KEY, logs.map(normalizeLogItem));
}

async function readExtras(): Promise<SadhanaLogs[]> {
  const parsed = await readJson<any>(JOURNEY_EXTRAS_KEY);
  if (!Array.isArray(parsed)) return [];
  return (parsed as SadhanaLogs[])
    .map(normalizeLogItem)
    .filter((x) => x.dateTime && x.sadanaId)
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime));
}

async function writeExtras(logs: SadhanaLogs[]) {
  await writeJson(JOURNEY_EXTRAS_KEY, logs.map(normalizeLogItem));
}

function addLocalWithCap(prev: SadhanaLogs[], item: SadhanaLogs, cap: number) {
  const next = [...prev, normalizeLogItem(item)].filter((x) => x.dateTime && x.sadanaId);
  const capped: SadhanaLogs[] = [];
  const counts = new Map<string, number>();
  for (const x of next) {
    const key = `${x.dateTime}__${x.sadanaId}`;
    const c = counts.get(key) || 0;
    if (c >= cap) continue;
    counts.set(key, c + 1);
    capped.push(x);
  }
  capped.sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  return capped;
}

function removeOne(prev: SadhanaLogs[], item: SadhanaLogs) {
  const t = normalizeLogItem(item);
  const idx = prev.findIndex((x) => x.dateTime === t.dateTime && x.sadanaId === t.sadanaId);
  if (idx < 0) return prev;
  const next = prev.slice();
  next.splice(idx, 1);
  return next;
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

  const text = await res.text().catch(() => "");
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

function isAlreadyOptedError(e: unknown) {
  const msg = String((e as any)?.message || "");
  return msg.toLowerCase().includes("already opted");
}
