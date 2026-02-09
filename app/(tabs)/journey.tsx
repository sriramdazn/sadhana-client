import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Screen from "../../components/Screen";
import GlassCard from "../../components/GlassCard";
import Dialog from "../../components/Dialog";
import { theme } from "../../constants/theme";

type LogItem = { id: string; title: string; points: number };
type DayLogs = { dayLabel: string; items: LogItem[] };

export default function JourneyScreen() {
  const initialData: DayLogs[] = useMemo(
    () => [
      {
        dayLabel: "5th Feb",
        items: [
          { id: "a1", title: "Surya Namaskar", points: 50 },
          { id: "a2", title: "Bhutta Shudhi", points: 50 },
          { id: "a3", title: "Shakti Chalana Kriya", points: 50 },
        ],
      },
      {
        dayLabel: "6th Feb",
        items: [
          { id: "b1", title: "Surya Namaskar", points: 50 },
          { id: "b2", title: "Bhutta Shudhi", points: 50 },
        ],
      },
    ],
    []
  );

  const [data, setData] = useState<DayLogs[]>(initialData);
  const [deleteTarget, setDeleteTarget] = useState<{ day: string; id: string } | null>(null);

  const openDeleteDialog = (payload: { day: string; id: string }) => setDeleteTarget(payload);
  const closeDeleteDialog = () => setDeleteTarget(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { day, id } = deleteTarget;
    setData((prev) =>
      prev
        .map((d) =>
          d.dayLabel === day ? { ...d, items: d.items.filter((x) => x.id !== id) } : d
        )
        .filter((d) => d.items.length > 0)
    );
    setDeleteTarget(null);
  };
  

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Sadhana Logs</Text>

        <GlassCard style={{ marginTop: 12 }}>
          <View style={{ gap: 16 }}>
            {data.map((day) => (
              <View key={day.dayLabel}>
                <Text style={styles.dayLabel}>{day.dayLabel}</Text>

                <View style={{ gap: 10, marginTop: 10 }}>
                  {day.items.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => openDeleteDialog({ day: day.dayLabel, id: item.id })}
                      style={styles.logRow}
                    >
                      <Text style={styles.logText}>{item.title}</Text>
                      <Text style={styles.logPts}>+{item.points}pts</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </GlassCard>
      </ScrollView>

      <Dialog
        visible={!!deleteTarget}
        title="Are you sure?"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        cancelText="Cancel"
        confirmText="Delete"
        confirmType="warning"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontWeight: "900", fontSize: 22, marginTop: 8 },
  dayLabel: { color: theme.colors.muted, fontWeight: "900", marginTop: 4 },

  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  logText: { color: theme.colors.text, fontWeight: "900" },
  logPts: { color: theme.colors.muted, fontWeight: "900" },
});
