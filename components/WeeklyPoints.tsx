import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export default function WeeklyPoints() {
  const bars = [18, 30, 22, 45, 38, 55, 48];
  const max = Math.max(...bars);

  return (
    <View>
      <Text style={styles.h}>Weekly Points</Text>

      <View style={styles.chart}>
        {bars.map((v, i) => (
          <View key={i} style={styles.barWrap}>
            <View style={[styles.bar, { height: 10 + (v / max) * 44 }]} />
          </View>
        ))}
      </View>

      <View style={styles.days}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <Text key={d} style={styles.day}>
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  h: { color: theme.colors.text, fontWeight: "900", fontSize: 16, marginBottom: 10 },
  chart: {
    height: 70,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(0,0,0,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  barWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 10, backgroundColor: "rgba(243,242,255,0.55)" },
  days: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  day: { color: theme.colors.muted, fontWeight: "700", fontSize: 11 },
});
