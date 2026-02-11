import AsyncStorage from "@react-native-async-storage/async-storage";
import { HomeState, JourneyState } from "./types";
import { Repository } from "./repository";

const HOME_KEY = "sadhana_home_v1";
const JOURNEY_KEY = "sadhana_journey_v1";

function now() {
  return Date.now();
}

function getDefaultHomeState(): HomeState {
  return {
    totalPoints: 350,
    dailyDecay: -50,
    sadhanas: [
      { id: "surya", title: "Surya Namaskar", points: 50, completed: false },
      { id: "yoga", title: "Yogasanas", points: 50, completed: false },
      { id: "prana", title: "Pranayama", points: 50, completed: false },
      { id: "med", title: "Meditation", points: 50, completed: false },
    ],
    updatedAt: now(),
  };
}

function getDefaultJourneyState(): JourneyState {
  return {
    days: [
      {
        dayLabel: "5th Feb",
        items: [
          { id: "a1", title: "Surya Namaskar", points: 50 },
          { id: "a2", title: "Bhutta Shudhi", points: 50 },
        ],
      },
    ],
    updatedAt: now(),
  };
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function createLocalRepository(): Repository {
  return {
    async getHomeState() {
      return readJson(HOME_KEY, getDefaultHomeState());
    },

    async toggleSadhana(sadhanaId) {
      const prev = await readJson(HOME_KEY, getDefaultHomeState());

      const next = {
        ...prev,
        sadhanas: prev.sadhanas.map((s) => {
          if (s.id !== sadhanaId) return s;
          const nextCompleted = !s.completed;

          return { ...s, completed: nextCompleted };
        }),
        updatedAt: now(),
      };

      const toggled = next.sadhanas.find((s) => s.id === sadhanaId);
      if (toggled) {
        const delta = toggled.completed ? toggled.points : -toggled.points;
        next.totalPoints = prev.totalPoints + delta;
      }

      await writeJson(HOME_KEY, next);
      return next;
    },

    async setDailyDecay(dailyDecay) {
      const prev = await readJson(HOME_KEY, getDefaultHomeState());
      const next = { ...prev, dailyDecay, updatedAt: now() };
      await writeJson(HOME_KEY, next);
      return next;
    },

    async getJourneyState() {
      return readJson(JOURNEY_KEY, getDefaultJourneyState());
    },

    async deleteJourneyItem(dayLabel, itemId) {
      const prev = await readJson(JOURNEY_KEY, getDefaultJourneyState());

      const nextDays = prev.days
        .map((d) => {
          if (d.dayLabel !== dayLabel) return d;
          return { ...d, items: d.items.filter((x) => x.id !== itemId) };
        })
        .filter((d) => d.items.length > 0);

      const next: JourneyState = { days: nextDays, updatedAt: now() };
      await writeJson(JOURNEY_KEY, next);
      return next;
    },
  };
}
