import { useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GlassCard from "@/components/GlassCard";
import Dialog from "@/components/Dialog";
import Rows from "@/components/Rows";
import Screen from "@/components/Screen";
import StarAnimation from "@/components/StarAnimation";
import { theme } from "@/constants/theme";
import { COMPLETED_KEY, HOME_DAY_KEY, TOTAL_POINTS_KEY } from "@/constants/constant";
import { getSadhanas } from "@/services/SadhanaService";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useJourneyStore } from "@/hooks/useJourneyStore";
import { todayIso } from "@/utils/todayDate";
import { useIsFocused } from "@react-navigation/native";
import { Sadhana } from "@/components/types/types";
import { getSession } from "@/utils/storage";

export default function HomeScreen() {
  const [sadhanas, setSadhanas] = useState<Sadhana[]>([]);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Sadhana | null>(null);
  const [showStars, setShowStars] = useState(false);
  const [localPoints, setLocalPoints] = useState<number>(0);
  const [decayPoints, setDecayPoints] = useState<number>(-50);

  const scrollRef = useRef<ScrollView>(null);
  const isFocused = useIsFocused();
  const { isLoggedIn, accessToken } = useAuthStatus();
  const [saving, setSaving] = useState(false);
  const { addItem } = useJourneyStore({ isLoggedIn, accessToken });

  useEffect(() => {
    if (!isLoggedIn) {
      setCompletedIds({});
    }
  }, [isLoggedIn]);

  useEffect(() => {
    (async () => {
      // reset day state 
      const today = todayIso();
      const savedDay = await AsyncStorage.getItem(HOME_DAY_KEY);
      if (savedDay !== today) {
        await AsyncStorage.multiSet([
          [HOME_DAY_KEY, today],
          [COMPLETED_KEY, JSON.stringify({})],
        ]);
        setCompletedIds({});
      } else {
        const raw = await AsyncStorage.getItem(COMPLETED_KEY);
        if (raw) setCompletedIds(JSON.parse(raw));
      }
      // load sadhanas
      const data = await getSadhanas();
      setSadhanas(data.filter((item: any) => item.isActive));
    })().catch(() => {});
  }, []);

  useEffect(() => {
    if (!isFocused) return;
    // after journey delete home refresh to get updated tick & points
    (async () => {   
      // reload completed (already working)
      const cRaw = await AsyncStorage.getItem(COMPLETED_KEY);
      setCompletedIds(cRaw ? JSON.parse(cRaw) : {});
      // reload total points
      const pRaw = await AsyncStorage.getItem(TOTAL_POINTS_KEY);
      if (pRaw !== null) {
        setLocalPoints(Number(pRaw));
      }
      const session = await getSession();
      if (typeof session.decayPoints === "number") {
        setDecayPoints(session.decayPoints);
      }
    })();
  }, [isFocused]);

  const handleAdd = (item: Sadhana) => {
    if (completedIds[item.id]) return;
    setSelectedItem(item);
    setShowConfirm(true);
  };

  const confirmAddToJourney = async () => {
    if (!selectedItem || saving) return;
    setSaving(true);
    try {
      await addItem({
        date: todayIso(),
        sadanaId: selectedItem.id,
      });
      const nextCompleted = { ...completedIds, [selectedItem.id]: true };
      setCompletedIds(nextCompleted);
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(nextCompleted));
  
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
            {/* <Image source={require("@/assets/yoga.png")} style={styles.poseImage} resizeMode="contain" /> */}

            <View style={styles.pointsOverlay}>
              <Text style={styles.points}>{localPoints}</Text>
              <Text style={styles.pointsLabel}>Points</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today’s Sadhanas</Text>

        <GlassCard style={{ marginTop: 10 }}>
          <View style={{ gap: 12 }}>
            {sadhanas.map((item, index) => (
              <Rows
                key={item.id}
                index={index}
                title={item.name}
                subtitle="Daily Practice"
                points={item.points}
                action="done"
                isDone={!!completedIds[item.id]}
                onAdd={() => handleAdd(item)}
              />
            ))}
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
        confirmText="Yes"
        confirmType="primary"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  decayWrap: { width: "100%", alignItems: "flex-end", marginBottom: 10 },

  decay: {
    alignSelf: "flex-end",
    color: "#FFD166",
    fontSize: 13,
    fontWeight: "700",
    backgroundColor: "rgba(2505, 209, 102, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },

  sectionTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
    marginTop: 8,
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

  poseImage: {
    width: 135,
    height: 135,
    opacity: 0.35,
    tintColor: "rgba(255,255,255,0.6)",
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
