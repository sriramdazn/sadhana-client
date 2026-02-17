import { TOTAL_POINTS_KEY } from "@/constants/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Accept your real local log shape
type JourneyLog = {
  dateTime: string;   // ISO
  sadanaId: string;
  clientId?: string;
};

function normalizeIso(v: any) {
  return typeof v === "string" ? v : "";
}

function normalizeId(v: any) {
  return typeof v === "string" ? v : "";
}

export async function sadanaSyncPayload(args: { days: JourneyLog[] }) {
  const days = Array.isArray(args.days) ? args.days : [];

  // (optional) if backend cares about total points, keep reading it
  const pointsRaw = await AsyncStorage.getItem(TOTAL_POINTS_KEY);
  const points = pointsRaw ? Number(pointsRaw) || 0 : 0;

  // Deduplicate (dateTime + sadanaId) so we don’t send accidental repeats
  const seen = new Set<string>();
  const sadanas = [];

  for (const x of days) {
    const dateTime = normalizeIso((x as any)?.dateTime || (x as any)?.date || "");
    const sadanaId = normalizeId((x as any)?.sadanaId || (x as any)?.sadana || "");
    if (!dateTime || !sadanaId) continue;

    const key = `${dateTime}__${sadanaId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    sadanas.push({ sadanaId, dateTime });
  }

  // Sort newest first (optional)
  sadanas.sort((a, b) => b.dateTime.localeCompare(a.dateTime));

  return {
    // include points only if your verifyEmailOtp endpoint expects it
    // points,
    sadanas,
  };
}
