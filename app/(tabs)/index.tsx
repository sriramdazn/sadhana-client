import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import GlassCard from "@/components/GlassCard";
import Dialog from "@/components/Dialog";
import Rows from "@/components/Rows";
import Screen from "@/components/Screen";
import StarAnimation from "@/components/StarAnimation";

import { theme } from "@/constants/theme";
import { COMPLETED_KEY, TOTAL_POINTS_KEY } from "@/constants/constant";
import { getSadhanas } from "@/services/SadhanaService";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useJourneyStore } from "@/hooks/useJourneyStore";

import { todayIso, isoToDayLabel, isoDaysAgo, toIsoForSelectedDay } from "@/utils/todayDate";
import { useIsFocused } from "@react-navigation/native";
import { Sadhana } from "@/components/types/types";
import { getSession } from "@/utils/storage";
import { CompletedDailyCounts, migrateCompletedStorageToDailyCounts } from "@/utils/completedDailyCounts";

export default function HomeScreen() {
  const [sadhanas, setSadhanas] = useState<Sadhana[]>([]);
  const [completedByDate, setCompletedByDate] = useState<CompletedDailyCounts>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Sadhana | null>(null);
  const [showStars, setShowStars] = useState(false);
  const [localPoints, setLocalPoints] = useState<number>(0);
  const [decayPoints, setDecayPoints] = useState<number>(-50);
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const isFocused = useIsFocused();
  const { isLoggedIn, accessToken } = useAuthStatus();
  const { addItem } = useJourneyStore({ isLoggedIn, accessToken });

  // 3 tabs (daybefore yesterday, yesterday, today)
  const tabs = useMemo(() => {
    const dfy = isoDaysAgo(2);
    const y = isoDaysAgo(1);
    const t = isoDaysAgo(0);
    return [
      { iso: dfy, label: isoToDayLabel(dfy) },
      { iso: y, label: isoToDayLabel(y) },
      { iso: t, label: isoToDayLabel(t) },
    ];
  }, []);

  const [activeDateIso, setActiveDateIso] = useState(tabs[2]?.iso || todayIso());
  const activeCompleted = completedByDate[activeDateIso] || {};
  const maxPerItem = 2; // each sadhana can be added twice per day

  useEffect(() => {
    (async () => {
      try {
        const data = await getSadhanas();
        setSadhanas(data.filter((x: any) => x.isActive));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!isFocused) return;
    (async () => {
      // completed
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const normalized = migrateCompletedStorageToDailyCounts(parsed);
      setCompletedByDate(normalized);
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(normalized));

      // points
      const pRaw = await AsyncStorage.getItem(TOTAL_POINTS_KEY);
      if (pRaw != null) setLocalPoints(Number(pRaw) || 0);

      // decay
      const session = await getSession();
      if (typeof session.decayPoints === "number") setDecayPoints(session.decayPoints);
    })().catch(() => {});
  }, [isFocused]);

  const handleAdd = (item: Sadhana) => {
    const c = activeCompleted[item.id] || 0;
    if (c >= maxPerItem) return;
    setSelectedItem(item);
    setShowConfirm(true);
  };

  const confirmAddToJourney = async () => {
    if (!selectedItem || saving) return;

    const currentCount = activeCompleted[selectedItem.id] || 0;
    if (currentCount >= maxPerItem) {
      setShowConfirm(false);
      setSelectedItem(null);
      return;
    }
    setSaving(true);
    try {
      await addItem({
        dateTime: toIsoForSelectedDay(activeDateIso),
        sadanaId: selectedItem.id,
      });

      //increment count for selected day + sadhana
      const nextCount = Math.min(maxPerItem, currentCount + 1);
      const nextByDate: CompletedDailyCounts = {
        ...completedByDate,
        [activeDateIso]: {
          ...(completedByDate[activeDateIso] || {}),
          [selectedItem.id]: nextCount,
        },
      };

      setCompletedByDate(nextByDate);
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(nextByDate));

      // points
      const nextPoints = localPoints + selectedItem.points;
      setLocalPoints(nextPoints);
      await AsyncStorage.setItem(TOTAL_POINTS_KEY, String(nextPoints));

      setShowStars(true);
      setShowConfirm(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch (e: any) {
      alert(e?.message || "Failed to add sadhana");
    } finally {
      setSaving(false);
      setSelectedItem(null);
    }
  };

  return (
    <Screen>
      <StarAnimation
        visible={showStars}
        onComplete={() => {
          setShowStars(false);
          setSelectedItem(null);
        }}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.decayWrap}>
          <Text style={styles.decay}>Daily Decay: {decayPoints}</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.ring}>
            <View style={styles.innerGlow} />
            <View style={styles.pointsOverlay}>
              <Text style={styles.points}>{localPoints}</Text>
              <Text style={styles.pointsLabel}>Points</Text>
            </View>
          </View>
        </View>

        {/* Day tabs */}
        <View style={styles.tabsWrap}>
          {tabs.map((t) => {
            const active = t.iso === activeDateIso;
            return (
              <Pressable
                key={t.iso}
                onPress={() => setActiveDateIso(t.iso)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <GlassCard style={{ marginTop: 10 }}>
          <View style={{ gap: 12 }}>
            {sadhanas.map((item, index) => {
              const c = activeCompleted[item.id] || 0;
              const rowDisabled = saving || c >= maxPerItem;
              {{item.name}}
              return (
                <Rows
                  key={item.id}
                  index={index}
                  title={item.name}
                  subtitle="Daily Practice"
                  points={item.points}
                  action="done"
                  isDone={c > 0}
                  doneCount={c}
                  maxCount={maxPerItem}
                  disabled={rowDisabled}
                  onAdd={() => handleAdd(item)}
                />
              );
            })}
          </View>
        </GlassCard>
      </ScrollView>

      <Dialog
        visible={showConfirm}
        title="Are you sure you did this sadhana?"
        onCancel={() => {
          setShowConfirm(false);
          setSelectedItem(null);
        }}
        onConfirm={confirmAddToJourney}
        cancelText="Cancel"
        confirmText={saving ? "Saving..." : "Yes"}
        confirmType="primary"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabsWrap: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    height: 38,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  tabActive: {
    backgroundColor: "rgba(155, 93, 229, 0.95)",
    borderColor: "rgba(155, 93, 229, 0.95)",
  },
  tabText: { color: theme.colors.text, fontWeight: "800", fontSize: 13 },
  tabTextActive: { color: "#fff" },

  decayWrap: { width: "100%", alignItems: "flex-end", marginBottom: 10 },
  decay: {
    alignSelf: "flex-end",
    color: "#FFD166",
    fontSize: 13,
    fontWeight: "700",
    backgroundColor: "rgba(255, 209, 102, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },

  hero: { alignItems: "center", marginBottom: 24, marginTop: 12 },

  ring: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(75,58,119,0.6)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#9B5DE5",
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
  },

  innerGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,213,128,0.15)",
  },

  pointsOverlay: { position: "absolute", alignItems: "center", top: 50 },

  points: {
    fontSize: 60,
    fontWeight: "800",
    color: "rgba(255,255,255,0.5)",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowRadius: 3,
  },

  pointsLabel: {
    fontSize: 15,
    letterSpacing: 1.5,
    opacity: 0.6,
    color: "rgba(255,255,255,0.75)",
  },
});
