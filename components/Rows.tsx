import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export default function Rows({
  index,
  title,
  subtitle,
  points,
  action = "done",
  isDone = false,
  onAdd,
  disabled = false,
  doneCount = 0,
  maxCount = 2,
}: {
  index: number;
  title: string;
  subtitle?: string;
  points?: number;
  action?: "done";
  isDone?: boolean;
  onAdd?: () => void;
  disabled?: boolean;
  doneCount?: number;
  maxCount?: number;
}) {
  const count = Math.max(0, Math.min(maxCount, Number(doneCount) || 0));
  const hasCompleted = isDone || count > 0;

  const canAddMore = !disabled && count < maxCount;

  const handlePress = () => {
    if (!canAddMore) return;
    onAdd?.();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && canAddMore ? { opacity: 0.85 } : null,
        disabled ? { opacity: 0.55 } : null,
      ]}
      onPress={handlePress}
      disabled={!canAddMore}
    >
      <View style={styles.left}>
        <View style={styles.iconBubble}>
          <Text style={styles.icon}>✨</Text>
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.right}>
        {hasCompleted ? (
          <View style={styles.ticksWrap}>
            {/* Completed ticks */}
            {Array.from({ length: count }).map((_, i) => (
              <View key={`tick_${i}`} style={styles.tickCircle}>
                <Text style={styles.tickText}>✓</Text>
              </View>
            ))}

            {/* Remaining slots (visual) */}
            {Array.from({ length: Math.max(0, maxCount - count) }).map((_, i) => (
              <View key={`slot_${i}`} style={styles.slotCircle}>
                <Text style={styles.slotText}>+</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.pointsPill}>
            <Text style={styles.pointsText}>+ {points ?? 0}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },

  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  icon: { fontSize: 18 },

  textWrap: { flex: 1 },
  title: { color: theme.colors.text, fontWeight: "900", fontSize: 16 },
  subtitle: {
    color: theme.colors.muted,
    fontWeight: "800",
    marginTop: 2,
    fontSize: 12,
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  pointsPill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  pointsText: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 13,
  },

  ticksWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tickCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  tickText: { color: "#fff", fontWeight: "900", fontSize: 15 },

  slotCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
  },
  slotText: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "900",
    fontSize: 16,
    lineHeight: 18,
  },
});
