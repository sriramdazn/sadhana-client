import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Screen from "@/components/Screen";
import GlassCard from "@/components/GlassCard";
import Dialog from "@/components/Dialog";
import { theme } from "@/constants/theme";

import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useJourneyStore } from "@/hooks/useJourneyStore";

import { todayIso } from "@/utils/todayDate";
import { COMPLETED_KEY, TOTAL_POINTS_KEY } from "@/constants/constant";

type LogItem = {
  date: string; // YYYY-MM-DD
  sadanaId: string;
};

export default function JourneyScreen() {
  const { isLoggedIn, accessToken, userId } = useAuthStatus();
  console.log("AUTH (Journey):", { isLoggedIn, hasToken: !!accessToken, userId });

  const { days, loading, load, deleteItem } = useJourneyStore({ isLoggedIn, accessToken });

  // days could be [] OR { days: [] } depending on your hook/service
  const logs: LogItem[] = useMemo(() => {
    const v: any = days;
    if (Array.isArray(v)) return v as LogItem[];
    if (v && Array.isArray(v.days)) return v.days as LogItem[];
    return [];
  }, [days]);

  const grouped = useMemo(() => {
    // Record<date, LogItem[]>
    return logs.reduce((acc: Record<string, LogItem[]>, item) => {
      (acc[item.date] ||= []).push(item);
      return acc;
    }, {});
  }, [logs]);

  const sortedDates = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => b.localeCompare(a)); // latest first
  }, [grouped]);

  const [deleteTarget, setDeleteTarget] = useState<LogItem | null>(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setDeleteTarget(null);

    // delete from store (remote/local depending on auth)
    await deleteItem(target);

    // If deleting today's entry, remove tick in Home
    if (target.date === todayIso()) {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const completed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};

      if (completed[target.sadanaId]) {
        delete completed[target.sadanaId];
        await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
      }
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Sadhana Logs</Text>

        <GlassCard style={{ marginTop: 12 }}>
          {loading ? (
            <Text style={styles.loading}>Loading...</Text>
          ) : sortedDates.length === 0 ? (
            <Text style={styles.loading}>No logs yet</Text>
          ) : (
            <View style={{ gap: 16 }}>
              {sortedDates.map((date) => (
                <View key={date}>
                  <Text style={styles.dayLabel}>{date}</Text>

                  <View style={{ gap: 10, marginTop: 10 }}>
                    {grouped[date].map((item) => (
                      <Pressable
                        key={`${item.date}_${item.sadanaId}`}
                        onPress={() => setDeleteTarget(item)}
                        style={styles.logRow}
                      >
                        <Text style={styles.logText}>{item.sadanaId}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </GlassCard>
      </ScrollView>

      <Dialog
        visible={!!deleteTarget}
        title="Are you sure?"
        onCancel={() => setDeleteTarget(null)}
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
  loading: { color: theme.colors.muted, fontWeight: "800" },
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
});
