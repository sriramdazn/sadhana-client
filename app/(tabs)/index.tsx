import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import GlassCard from "@/components/GlassCard";
import { theme } from "@/constants/theme";
import Screen from "@/components/Screen";
import Rows from "@/components/Rows";

type Sadhana = { id: string; title: string; points: number };
export default function HomeScreen() {
  const sadhanas: Sadhana[] = useMemo(
    () => [
      { id: "surya", title: "Surya Namaskar", points: 50 },
      { id: "yoga", title: "Yogasanas", points: 50 },
      { id: "prana", title: "Pranayama", points: 50 },
      { id: "med", title: "Meditation", points: 50 },
    ],
    []
  );
  const [pendingConfirmId, setPendingConfirmId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [dailyDecay] = useState(-50);
  const [totalPoints, setTotalPoints] = useState(350);

  const handleTilePress = (item: Sadhana) => {
    if (completedIds[item.id]) return;

    if (pendingConfirmId === item.id) {
      // confirm
      setCompletedIds((p) => ({ ...p, [item.id]: true }));
      setPendingConfirmId(null);
      setTotalPoints((p) => p + item.points);
      return;
    }
    setPendingConfirmId(item.id);
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
          <View style={{ gap: 12 }}>
          {sadhanas.map((item, index) => {
              return ( 
                <Rows index={index} title={item.title} subtitle="+${item.points} pts" action="done" />
              )})};
          </View>

          <View style={{ height: 14 }} />
        </GlassCard>
      </ScrollView>
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
  decay: {
    color: theme.colors.muted,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
    marginTop: 8,
  },
});

