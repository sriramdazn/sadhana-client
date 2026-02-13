type LogItem = { date: string; sadanaId: string };

export function sadanaSyncPayload(args: { days: LogItem[] }) {
  const days = Array.isArray(args.days) ? args.days : [];

  const map: Record<string, Set<string>> = {};
  for (const x of days) {
    if (!x?.date || !x?.sadanaId) continue;
    (map[x.date] ||= new Set()).add(x.sadanaId);
  }

  return {
    sadanas: Object.keys(map).map((date) => ({
      date,
      optedSadanas: Array.from(map[date]),
    })),
  };
}
