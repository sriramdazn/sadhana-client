import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useJourneyStore } from "@/hooks/useJourneyStore";
import Screen from "@/components/Screen";
import GlassCard from "@/components/GlassCard";
import Dialog from "@/components/Dialog";
import { theme } from "@/constants/theme";
import { todayLabel } from "@/utils/todayDate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COMPLETED_KEY, TOTAL_POINTS_KEY } from "@/constants/constant";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export default function JourneyScreen() {
  
  const { isLoggedIn, accessToken } = useAuthStatus();
  const { days, loading, load, deleteItem } = useJourneyStore({isLoggedIn, accessToken});
  const [deleteTarget, setDeleteTarget] = useState<{ day: string; id: string; sadhanaId: string; points: number;} | null>(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openDeleteDialog = (payload: { day: string; id: string; sadhanaId: string; points: number; }) => setDeleteTarget(payload);
  const closeDeleteDialog = () => setDeleteTarget(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { day, id, sadhanaId, points } = deleteTarget;
    setDeleteTarget(null);
    await deleteItem(day, id);
  
    //deleting today's entry, remove tick in Home
    if (day === todayLabel()) {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const completed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  
      if (completed[sadhanaId]) {
        delete completed[sadhanaId];
        await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
      }
  
      //reduce points when delete sadhana
      const pRaw = await AsyncStorage.getItem(TOTAL_POINTS_KEY);
      const currentPoints = pRaw ? Number(pRaw) : 350;
      const nextPoints = Math.max(0, currentPoints - points);
      await AsyncStorage.setItem(TOTAL_POINTS_KEY, String(nextPoints));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Sadhana Logs</Text>

        <GlassCard style={{ marginTop: 12 }}>
          {loading ? (
            <Text style={styles.loading}>Loading...</Text>
          ) : (
            <View style={{ gap: 16 }}>
              {days.map((day) => (
                <View key={day.dayLabel}>
                  <Text style={styles.dayLabel}>{day.dayLabel}</Text>

                  <View style={{ gap: 10, marginTop: 10 }}>
                    {day.items.map((item: any) => (
                      <Pressable
                        key={item.id}
                        onPress={() => openDeleteDialog({ day: day.dayLabel, id: item.id, sadhanaId: item.sadhanaId, points: item.points })}
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
          )}
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
