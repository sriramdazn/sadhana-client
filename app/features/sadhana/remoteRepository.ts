import { Repository } from "./repository";
import { HomeState, JourneyState, SadhanaId } from "./types";

type CreateRemoteRepoArgs = {
  baseUrl: string;
  accessToken: string;
};

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
    throw new Error(text || `API Error: ${res.status}`);
  }

  return (await res.json()) as T;
}

export function createRemoteRepository({ baseUrl, accessToken }: CreateRemoteRepoArgs): Repository {
  return {
    getHomeState: () => api<HomeState>(`${baseUrl}/home`, "GET", accessToken),

    toggleSadhana: (sadhanaId: SadhanaId) =>
      api<HomeState>(`${baseUrl}/home/toggle`, "POST", accessToken, { sadhanaId }),

    setDailyDecay: (dailyDecay: number) =>
      api<HomeState>(`${baseUrl}/home/daily-decay`, "PUT", accessToken, { dailyDecay }),

    getJourneyState: () => api<JourneyState>(`${baseUrl}/journey`, "GET", accessToken),

    deleteJourneyItem: (dayLabel: string, itemId: string) =>
      api<JourneyState>(`${baseUrl}/journey/item`, "DELETE", accessToken, { dayLabel, itemId }),
  };
}
