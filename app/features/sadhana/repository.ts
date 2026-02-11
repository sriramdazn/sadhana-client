import { HomeState, JourneyState, SadhanaId } from "./types";

export type Repository = {
  getHomeState: () => Promise<HomeState>;
  toggleSadhana: (sadhanaId: SadhanaId) => Promise<HomeState>;
  setDailyDecay: (dailyDecay: number) => Promise<HomeState>;

  getJourneyState: () => Promise<JourneyState>;
  deleteJourneyItem: (dayLabel: string, itemId: string) => Promise<JourneyState>;
};
