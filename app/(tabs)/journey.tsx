import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Screen from "@/components/Screen";
import GlassCard from "@/components/GlassCard";
import Dialog from "@/components/Dialog";
import { theme } from "@/constants/theme";

import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useJourneyStore } from "@/hooks/useJourneyStore";

import { todayIso, isoToDayLabel } from "@/utils/todayDate";
import { COMPLETED_KEY, TOTAL_POINTS_KEY } from "@/constants/constant";
import { getSadhanas } from "@/services/SadhanaService";
import { Sadhana, SadhanaLogs } from "@/components/types/types";
import { router } from "expo-router";

export default function JourneyScreen({ navigation }: any) {
  const { isLoggedIn, accessToken } = useAuthStatus();
  const { days, loading, load, deleteItem } = useJourneyStore({ isLoggedIn, accessToken });

  // reload when screen focused
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // reload on login change
  useEffect(() => {
    load();
  }, [isLoggedIn, accessToken, load]);

  const [sadanaMap, setSadanaMap] = useState<Record<string, { name: string; points: number }>>({});

  useEffect(() => {
    (async () => {
      try {
        const list: Sadhana[] = await getSadhanas();
        const map: Record<string, { name: string; points: number }> = {};
        list.forEach((s) => {
          map[s.id] = { name: s.name, points: s.points };
        });
        setSadanaMap(map);
      } catch {}
    })();
  }, []);

  const logs: SadhanaLogs[] = useMemo(() => (Array.isArray(days) ? days : []), [days]);

  const grouped = useMemo(() => {
    return logs.reduce((acc: Record<string, SadhanaLogs[]>, item) => {
      (acc[item.date] ||= []).push(item);
      return acc;
    }, {});
  }, [logs]);

  const sortedDates = useMemo(() => Object.keys(grouped).sort((a, b) => b.localeCompare(a)), [grouped]);

  const [deleteTarget, setDeleteTarget] = useState<SadhanaLogs | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setDeleteTarget(null);

    await deleteItem({ date: target.date, sadanaId: target.sadanaId });

    // remove tick if deleting today
    if (target.date === todayIso()) {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const completed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      if (completed[target.sadanaId]) {
        delete completed[target.sadanaId];
        await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
      }

      // subtract points
      const pts = sadanaMap[target.sadanaId]?.points || 0;
      if (pts > 0) {
        const pRaw = await AsyncStorage.getItem(TOTAL_POINTS_KEY);
        const current = pRaw ? Number(pRaw) : 0;
        const next = Math.max(0, current - pts);
        await AsyncStorage.setItem(TOTAL_POINTS_KEY, String(next));
      }
    }
  };

  const hasNoLogs = !loading && sortedDates.length === 0;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Sadhana Logs</Text>
                <GlassCard style={{ marginTop: 12 }}>
          {loading ? (
            <Text style={styles.loading}>Loading...</Text>
          ) : sortedDates.length === 0 ? (
            // <Text style={styles.loading}>No logs yet</Text>
            <EmptyLogs
            onPrimary={() => router.replace("/")}
            // onSecondary={() => navigation.navigate("Discover")}
            // showSecondary={true}
          />
          ) : (
            <View style={{ gap: 16 }}>
              {sortedDates.map((date) => (
                <View key={date}>
                  <Text style={styles.dayLabel}>{isoToDayLabel(date)}</Text>

                  <View style={{ gap: 10, marginTop: 10 }}>
                    {grouped[date].map((item) => {
                      const meta = sadanaMap[item.sadanaId];
                      return (
                        <Pressable
                          key={`${item.date}_${item.sadanaId}`}
                          onPress={() => setDeleteTarget(item)}
                          style={styles.logRow}
                        >
                          <Text style={styles.logText}>{meta?.name}</Text>
                          {!!meta?.points && <Text style={styles.logPts}>+{meta.points}pts</Text>}
                        </Pressable>
                      );
                    })}
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

/** ---------- Empty State Component ---------- */
function EmptyLogs({
  onPrimary,
  onSecondary,
  showSecondary = true,
}: {
  onPrimary: () => void;
  onSecondary?: () => void;
  showSecondary?: boolean;
}) {
  return (
    <View style={emptyStyles.wrap}>

      <Text style={emptyStyles.emoji}>📿</Text>

      <Text style={emptyStyles.title}>No Sadhana Logs Yet</Text>
      <Text style={emptyStyles.subtitle}>
        Your daily practices will appear here once you complete them.
        Start today and watch your journey grow.
      </Text>

      <Pressable style={emptyStyles.primaryBtn} onPress={onPrimary}>
        <Text style={emptyStyles.primaryBtnText}>Start Today’s Sadhana</Text>
      </Pressable>

      {/* {showSecondary && onSecondary ? (
        <Pressable style={emptyStyles.secondaryBtn} onPress={onSecondary}>
          <Text style={emptyStyles.secondaryBtnText}>Browse Sadhanas</Text>
        </Pressable>
      ) : null} */}

      <View style={emptyStyles.tipBox}>
        <Text style={emptyStyles.tipTitle}>Pro tip</Text>
        <Text style={emptyStyles.tipText}>
          Press a log to delete it. Your total points update automatically.
        </Text>
      </View>
    </View>
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
  logPts: { color: theme.colors.muted, fontWeight: "900" },
});

/** Empty state styles */
const emptyStyles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 22,
    paddingHorizontal: 14,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  title: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 18,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginHorizontal: 8,
  },
  primaryBtn: {
    marginTop: 8,
    width: "100%",
    height: 44,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(155, 93, 229, 0.95)",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  secondaryBtn: {
    marginTop: 8,
    width: "100%",
    height: 44,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  secondaryBtnText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 15,
  },
  tipBox: {
    marginTop: 10,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tipTitle: { color: theme.colors.text, fontWeight: "900", fontSize: 13, marginBottom: 2 },
  tipText: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
});