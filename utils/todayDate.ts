const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function ordinal(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  if (mod10 === 1) return "st";
  if (mod10 === 2) return "nd";
  if (mod10 === 3) return "rd";
  return "th";
}

export function todayLabel() {
    const d = new Date();
    const day = d.getDate();
    return `${day}${ordinal(day)} ${MONTHS[d.getMonth()]}`;
}

export function todayIso(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isoToDayLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  const day = d.getDate();
  return `${day}${ordinal(day)} ${MONTHS[d.getMonth()]}`;
}

/** "2026-02-13T00:00:00.000Z" => "2026-02-13" */
export function toYmd(dateStr: string) {
  if (!dateStr) return "";
  return dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr;
}

export function isoDaysAgo(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return todayIso(d);
}

export function toIsoForSelectedDay(activeDateIso: string) {
  // activeDateIso: "YYYY-MM-DD"
  const [y, m, d] = activeDateIso.split("-").map(Number);
  if (!y || !m || !d) return new Date().toISOString();

  const now = new Date();
  const dt = new Date(
    y,
    m - 1,
    d,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  );
  return dt.toISOString();
}

