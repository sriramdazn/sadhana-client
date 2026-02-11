import AsyncStorage from "@react-native-async-storage/async-storage";

export type HomeSadhana = {
  id: string;
  title: string;
  points: number;
  completed: boolean;
};

export type HomeState = {
  totalPoints: number;
  dailyDecay: number;
  sadhanas: HomeSadhana[];
  updatedAt: number;
};

export type JourneyItem = { id: string; title: string; points: number };
export type JourneyDay = { dayLabel: string; items: JourneyItem[] };

export type JourneyState = {
  days: JourneyDay[];
  updatedAt: number;
};

const KEYS = {
  home: "sadhana_home",
  journey: "sadhana_journey",
  syncedForUser: (userId: string) => `sadhana_guest_synced:${userId}`,
};

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

export const useGuestStorage = {
  KEYS,

  // Home
  async getHome(): Promise<HomeState | null> {
    return readJson<HomeState>(KEYS.home);
  },
  async setHome(state: HomeState) {
    await writeJson(KEYS.home, state);
  },

  // Journey
  async getJourney(): Promise<JourneyState | null> {
    return readJson<JourneyState>(KEYS.journey);
  },
  async setJourney(state: JourneyState) {
    await writeJson(KEYS.journey, state);
  },

  // Sync flag
  async wasSyncedForUser(userId: string): Promise<boolean> {
    return (await AsyncStorage.getItem(KEYS.syncedForUser(userId))) === "1";
  },
  async markSyncedForUser(userId: string) {
    await AsyncStorage.setItem(KEYS.syncedForUser(userId), "1");
  },

  // Optional cleanup after successful sync
  async clearGuestData() {
    await AsyncStorage.multiRemove([KEYS.home, KEYS.journey]);
  },
};
