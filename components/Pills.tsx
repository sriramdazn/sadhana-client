import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export default function Pill({ label, active }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.pill, active && styles.active]}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.soft,
    marginRight: 10,
  },
  active: {
    backgroundColor: "rgba(232,210,181,0.22)",
    borderColor: "rgba(232,210,181,0.35)",
  },
  text: { color: theme.colors.muted, fontWeight: "700", fontSize: 12 },
  textActive: { color: theme.colors.text },
});
