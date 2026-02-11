import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GlassCard from "@/components/GlassCard";
import { theme } from "@/constants/theme";
import Screen from "@/components/Screen";
import Rows from "@/components/Rows";
import Dialog from "@/components/Dialog";
import { useJourneyStore } from "@hooks/useJourneyStore";

type Sadhana = { id: string; title: string; points: number };

const API_URL = "http://localhost:8086/v1/sadanas"; // change if needed

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function ordinal(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  if (mod10 === 1) return "st";
  if (mod10 === 2) return "nd";
  if (mod10 === 3) return "rd";
  return "th";
}
function todayLabel(date = new Date()) {
  const d = date.getDate();
  return `${d}${ordinal(d)} ${MONTHS[date.getMonth()]}`;
}

function normalizeSadanas(payload: any): Sadhana[] {
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  return list
    .map((x: any) => ({
      id: String(x.id ?? x._id ?? x.key ?? x.title ?? Math.random()),
      title: String(x.title ?? x.name ?? ""),
      points: Number(x.points ?? x.score ?? 0),
    }))
    .filter((x: Sadhana) => x.title && Number.isFinite(x.points));
}

export default function HomeScreen() {
  const [sadhanas, setSadhanas] = useState<Sadhana[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const [selected, setSelected] = useState<Sadhana | null>(null);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [dailyDecay] = useState(-50);
  const [totalPoints, setTotalPoints] = useState(350);

  // TODO: wire real auth later
  const isLoggedIn = false;
  const accessToken: string | null = null;

  const { addItem } = useJourneyStore({ isLoggedIn, accessToken });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setErrorText("");
      try {
        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
        const list = normalizeSadanas(json);
        setSadhanas(list);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setErrorText(e?.message ?? "Failed to load sadhanas");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const handleRowPress = (item: Sadhana) => {
    if (completedIds[item.id]) return;
    setSelected(item);
  };

  const closeDialog = () => setSelected(null);

  const confirmAddToJourney = async () => {
    if (!selected) return;

    // mark done + update points
    setCompletedIds((p) => ({ ...p, [selected.id]: true }));
    setTotalPoints((p) => p + selected.points);

    // add to journey (guest => AsyncStorage; logged-in => API)
    await addItem(todayLabel(), {
      id: `${Date.now()}_${selected.id}`,
      title: selected.title,
      points: selected.points,
    });

    setSelected(null);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={styles.pointsRow}>
          <View style={styles.circle}>
            <Text style={styles.circleText}>{totalPoints}pts</Text>
          </View>
        </View>

        <Text style={styles.decay}>Daily Decay: {dailyDecay}</Text>
        <Text style={styles.sectionTitle}>Today’s Sadhanas</Text>

        <GlassCard style={{ marginTop: 10 }}>
          {loading ? (
            <Text style={styles.muted}>Loading...</Text>
          ) : errorText ? (
            <Text style={styles.error}>{errorText}</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {sadhanas.map((item, index) => {
                const done = !!completedIds[item.id];
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    disabled={done}
                    onPress={() => handleRowPress(item)}
                    style={{ opacity: done ? 0.55 : 1 }}
                  >
                    <Rows
                      index={index}
                      title={item.title}
                      subtitle={`+${item.points} pts`}
                      action={done ? "done" : "add"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: 14 }} />
        </GlassCard>
      </ScrollView>

      <Dialog
        visible={!!selected}
        title={selected ? `Add "${selected.title}" to Journey?` : "Add to Journey?"}
        onCancel={closeDialog}
        onConfirm={confirmAddToJourney}
        cancelText="Cancel"
        confirmText="Add"
        confirmType="primary"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pointsRow: { alignItems: "center", paddingTop: 4, paddingBottom: 10 },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "rgba(243,242,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  circleText: { color: theme.colors.text, fontWeight: "900", fontSize: 18 },
  decay: { color: theme.colors.muted, fontWeight: "800", textAlign: "center", marginBottom: 14 },
  sectionTitle: { color: theme.colors.text, fontWeight: "900", fontSize: 16, marginTop: 8 },
  muted: { color: theme.colors.muted, fontWeight: "800" },
  error: { color: "#ff8b8b", fontWeight: "800" },
});
