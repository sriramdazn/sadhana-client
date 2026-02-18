import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InfiniteScroll } from "antd-mobile";

import Screen from "@/components/Screen";
import GlassCard from "@/components/GlassCard";
import Dialog from "@/components/Dialog";
import { theme } from "@/constants/theme";

import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useJourneyStore } from "@/hooks/useJourneyStore";

import { isoToDayLabel, toYmd } from "@/utils/todayDate";
import { COMPLETED_KEY, TOTAL_POINTS_KEY } from "@/constants/constant";
import { getSadhanas } from "@/services/SadhanaService";
import { Sadhana, SadhanaLogs } from "@/components/types/types";
import { router } from "expo-router";
import { EmptyLogs } from "@/components/EmptyLogs";
import { migrateCompletedStorageToDailyCounts } from "@/utils/completedDailyCounts";

export default function JourneyScreen() {
  const { isLoggedIn, accessToken } = useAuthStatus();
  const { days, loading, load, loadNextPage, deleteItem, hasMore } = useJourneyStore({
    isLoggedIn,
    accessToken,
  });

  const [sadanaMap, setSadanaMap] = useState<Record<string, { name: string; points: number }>>({});
  const [deleteTarget, setDeleteTarget] = useState<SadhanaLogs | null>(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const logs: SadhanaLogs[] = useMemo(() => (Array.isArray(days) ? days : []), [days]);

  const grouped = useMemo(() => {
    return logs.reduce((acc: Record<string, SadhanaLogs[]>, item) => {
      const date = toYmd(item.dateTime);
      (acc[date] ||= []).push(item);
      return acc;
    }, {});
  }, [logs]);

  const sortedDates = useMemo(
    () => Object.keys(grouped).sort((a, b) => b.localeCompare(a)),
    [grouped]
  );

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    await deleteItem(target);

    const raw = await AsyncStorage.getItem(COMPLETED_KEY);
    const normalized = migrateCompletedStorageToDailyCounts(raw ? JSON.parse(raw) : {});

    const dayKey = toYmd(target.dateTime);
    const dayMap = { ...(normalized[dayKey] || {}) };
    const current = Number(dayMap[target.sadanaId] || 0);

    if (current > 1) {
      dayMap[target.sadanaId] = current - 1;
      normalized[dayKey] = dayMap;
    } else if (current === 1) {
      delete dayMap[target.sadanaId];
      if (Object.keys(dayMap).length === 0) delete normalized[dayKey];
      else normalized[dayKey] = dayMap;
    }

    await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(normalized));
    const pts = sadanaMap[target.sadanaId]?.points || 0;
    if (pts > 0) {
      const pRaw = await AsyncStorage.getItem(TOTAL_POINTS_KEY);
      const currentPoints = pRaw ? Number(pRaw) : 0;
      const next = Math.max(0, currentPoints - pts);
      await AsyncStorage.setItem(TOTAL_POINTS_KEY, String(next));
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>My Sadhana Logs</Text>

        <GlassCard style={{ marginTop: 12 }}>
          {loading && logs.length === 0 ? (
            <Text style={styles.loading}>Loading...</Text>
          ) : sortedDates.length === 0 && !hasMore ? (
            <EmptyLogs onPrimary={() => router.replace("/")} />
          ) : (
            <View style={{ gap: 16 }}>
              {sortedDates.map((date) => (
                <View key={date}>
                  <Text style={styles.dayLabel}>{isoToDayLabel(date)}</Text>

                  <View style={{ gap: 10, marginTop: 10 }}>
                    {grouped[date].map((item, idx) => {
                      const meta = sadanaMap[item.sadanaId];
                      return (
                        <Pressable
                          key={`${item.dateTime}_${item.sadanaId}_${idx}`}
                          onPress={() => setDeleteTarget(item)}
                          style={styles.logRow}
                        >
                          <Text style={styles.logText}>{meta?.name}</Text>
                          {!!meta?.points && (
                            <Text style={styles.logPts}>+{meta.points}pts</Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}

              <InfiniteScroll style={styles.kya} loadMore={loadNextPage} hasMore={hasMore}>
                {hasMore ? (
                  <Text style={styles.loadingMore}>Loading...</Text>
                ) : (
                  null
                )}
              </InfiniteScroll>
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
  logPts: { color: theme.colors.muted, fontWeight: "900" },
  loadingMore: { textAlign: "center", paddingVertical: 0, color: "#999" },
  endText: { textAlign: "center", paddingVertical: 10, color: "#666" },
  kya: {margin: 0 , padding: 0}
});
