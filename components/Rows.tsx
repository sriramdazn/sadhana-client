import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";

type Variant = "peach" | "coral" | "sand";

type Props = {
  title: string;
  subtitle: string;
  points: number;
  index: number;
  action?: "add" | "done";
  isDone?: boolean;
  onAdd: () => void; 
  variant?: Variant;
};

const bgMap: Record<Variant, string> = {
  peach: "rgba(242,179,155,0.26)",
  coral: "rgba(240,126,126,0.26)",
  sand: "rgba(232,210,181,0.22)",
};

function getVariantFromIndex(index: number): Variant {
  const cycle = index % 3;
  if (cycle === 0) return "peach";
  if (cycle === 1) return "coral";
  return "sand";
}

export default function SadhanaRow({
  title,
  subtitle,
  points,
  index,
  action = "add",
  isDone = false,
  onAdd,
  variant,
}: Props) {
  const resolvedVariant = variant ?? getVariantFromIndex(index);

  return (
    <View style={[styles.row, { backgroundColor: bgMap[resolvedVariant] }]}>
      <View style={styles.leftIcon}>
        <Ionicons name="sparkles" size={18} color={theme.colors.text} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, isDone && { opacity: 0.5 }]}
        disabled={isDone}
        onPress={onAdd}
      >
        {isDone ? (
        <Ionicons name="checkmark" size={18} color={theme.colors.text} />
      ) : (
        <Text style={styles.btnText}>+ {points}</Text>
      )}

      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radius.lg,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  leftIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  title: { color: theme.colors.text, fontWeight: "800", fontSize: 14 },
  sub: { color: theme.colors.muted, marginTop: 2, fontWeight: "600", fontSize: 12 },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  btnText: { color: theme.colors.text, fontWeight: "800", fontSize: 12 },
});
