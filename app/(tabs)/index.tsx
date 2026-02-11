import React, { useMemo, useState, useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View, Image } from "react-native";
import GlassCard from "@/components/GlassCard";
import { theme } from "@/constants/theme";
import Screen from "@/components/Screen";
import Rows from "@/components/Rows";
import { getSadhanas } from "@/services/SadhanaService";
import Dialog from "@/components/Dialog";
import StarAnimation from "@/components/StarAnimation";
import { Sadhana } from "../features/sadhana/types";
import { useJourneyStore } from "@/hooks/useJourneyStore";
import { todayLabel } from "@/utils/todayDate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COMPLETED_KEY, TOTAL_POINTS_KEY} from "@/constants/constant";
import { useIsFocused } from "@react-navigation/native";

export default function HomeScreen() {
  const [sadhanas, setSadhanas] = useState<Sadhana[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Sadhana | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [dailyDecay] = useState(-50);
  const [totalPoints, setTotalPoints] = useState(350);
  const [showStars, setShowStars] = useState(false);
  const { addItem } = useJourneyStore();
  const isFocused = useIsFocused();

  const handleAdd = (item: Sadhana) => {
    if (completedIds[item.id]) return;
    setSelectedItem(item);
    setShowConfirm(true);
  };

  const confirmAddToJourney = async () => {
    if (!selectedItem) return;
  
    const nextCompleted = { ...completedIds, [selectedItem.id]: true };
    setCompletedIds(nextCompleted);
    await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(nextCompleted));
  
    const nextPoints = totalPoints + selectedItem.points;
    setTotalPoints(nextPoints);
    await AsyncStorage.setItem(TOTAL_POINTS_KEY, String(nextPoints));
  
    // add sadhana to journey 
    await addItem(todayLabel(), {
      id: `${Date.now()}_${selectedItem.id}`,
      title: selectedItem.name,
      points: selectedItem.points,
      sadhanaId: selectedItem.id,
    });
  
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setShowStars(true);
    setShowConfirm(false);
  };

  useEffect(() => {
    const loadHomeState = async () => {
      try {
        const savedSadhana = await AsyncStorage.getItem(COMPLETED_KEY);
        if (savedSadhana) setCompletedIds(JSON.parse(savedSadhana));
  
        const updatedPoints = await AsyncStorage.getItem(TOTAL_POINTS_KEY);
        if (updatedPoints) {
          const n = Number(updatedPoints);
          if (!Number.isNaN(n)) setTotalPoints(n);
        }
      } catch (e) {
        console.log("Error loading home state", e);
      }
    };
  
    loadHomeState();
  }, []);

  useEffect(() => {
    if (!isFocused) return;
    (async () => {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      if (raw) setCompletedIds(JSON.parse(raw));
      else setCompletedIds({});
      const pRaw = await AsyncStorage.getItem(TOTAL_POINTS_KEY);
      if (pRaw) setTotalPoints(Number(pRaw));
    })();
  }, [isFocused]);
  
  
  useEffect(() => {
    const loadSadhanas = async () => {
      try {
      //get sadhana
        const data: Sadhana[] = await getSadhanas();
        const activeData = data.filter(item => item.isActive);
        setSadhanas(activeData);
      } catch (err) {
        console.log("Error loading sadhanas");
      }
    };
    loadSadhanas();
  }, []);

  return (
    <Screen>
      <StarAnimation
        visible={showStars}
        onComplete={() => {
          setShowStars(false);
          setSelectedItem(null);
        }}
      />

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={styles.decayWrap}>
          <Text style={styles.decay}>Daily Decay: {dailyDecay}</Text>
        </View>
        <View style={styles.hero}>
          <View style={styles.ring}>
            <View style={styles.innerGlow} />
            <Image
              source={require("@/assets/yoga.png")}
              style={styles.poseImage}
              resizeMode="contain"
            />
            <View style={styles.pointsOverlay}>
              <Text style={styles.points}>{totalPoints}</Text>
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
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
    marginTop: 8,
  },

  hero: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 12,
  },



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


  /* Points */
  pointsOverlay: {
    position: "absolute",
    alignItems: "center",
    top: 50,   
  },


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
    color: "rgba(255,255,255,0.75)"
  },

  decayWrap: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 10,
  },

  starContainer: {
    position: "absolute",
    top: 100,
    flexDirection: "row",
    gap: 6,
  },

  star: {
    fontSize: 42,
  },

  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0F0C1E",
    zIndex: 100,
  },

  starWrapper: {
    position: "absolute",
    top: 100,
    flexDirection: "row",
    gap: 8,
    zIndex: 20,
  },




});
