export type Sadhana = {
  id: string;
  name: string;
  points: number;
  isActive: boolean;
};

export type JourneyDay = {
  dayLabel: string;
  date: string;
  items: JourneyItem[];
};

export type JourneyItem = {
  id: string;
  title: string;
  points: number;
};

export type JourneyState = {
  days: JourneyDay[];
};

export type JourneyService = {
  isLoggedIn?: boolean;
  accessToken?: string | null;
};

export type SadhanaLogs = {
  dateTime: string;
  sadanaId: string;
};

export type LogItem = {
  date: string;
  sadanaId: string;
};

export type RemoteTrackerRow = {
  date: string; // "2026-02-13T00:00:00.000Z"
  optedSadanas?: string[];
};

export type RemoteTrackerResponse = {
  data?: RemoteTrackerRow[];
};
