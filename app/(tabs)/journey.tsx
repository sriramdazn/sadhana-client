import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@ant-design/react-native";
import Screen from "../../components/Screen";
import GlassCard from "../../components/GlassCard";
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

  const confirmDelete = () => {
    if (!deleteTarget) return;

    setData((prev) =>
      prev
        .map((d) => {
          if (d.dayLabel !== deleteTarget.day) return d;
          return { ...d, items: d.items.filter((x) => x.id !== deleteTarget.id) };
        })
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
                      onPress={() => setDeleteTarget({ day: day.dayLabel, id: item.id })}
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

      {/* Delete confirm modal */}
      <Modal transparent visible={!!deleteTarget} animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <Pressable style={styles.backdrop} onPress={() => setDeleteTarget(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Are you sure?</Text>

            <View style={styles.modalActions}>
              <Button type="ghost" onPress={() => setDeleteTarget(null)} style={styles.modalBtn}>
                Cancel
              </Button>
              <Button type="warning" onPress={confirmDelete} style={styles.modalBtn}>
                Delete
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(25,24,48,0.95)",
    padding: 16,
  },
  modalTitle: { color: theme.colors.text, fontWeight: "900", fontSize: 18, textAlign: "center" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  modalBtn: { flex: 1, borderRadius: 14 },
});
