export type SadhanaId = string;

export type HomeSadhana = {
  id: SadhanaId;
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

export type JourneyItem = {
  id: string;
  title: string;
  points: number;
};

export type JourneyDay = {
  dayLabel: string;
  items: JourneyItem[];
};

export type JourneyState = {
  days: JourneyDay[];
  updatedAt: number;
};
