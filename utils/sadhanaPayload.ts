type JourneyItem = { id: string; title: string; points: number; sadhanaId: string };
type JourneyDay = { dayLabel: string; items: JourneyItem[] };

function toIsoDateFromDayLabel(dayLabel: string, year = new Date().getFullYear()) {

  const parts = dayLabel.trim().split(" ");
  const dayNum = Number(parts[0].replace(/\D/g, ""));
  const monStr = parts[1];

  const monthMap: Record<string, number> = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
  };

  const monthNum = monthMap[monStr];
  const mm = String(monthNum).padStart(2, "0");
  const dd = String(dayNum).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function sadanaSyncPayload(args: {
  days: JourneyDay[];
  year?: number;
}) {
  const { days, year } = args;

  return {
    sadanas: days.map((d) => ({
      date: toIsoDateFromDayLabel(d.dayLabel, year),
      optedSadanas: Array.from(new Set(d.items.map((x) => x.sadhanaId))),
    })),
  };
}
