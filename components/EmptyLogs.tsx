import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export function EmptyLogs({
    onPrimary,
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
  
        <View style={emptyStyles.tipBox}>
          <Text style={emptyStyles.tipTitle}>Pro tip</Text>
          <Text style={emptyStyles.tipText}>
            Press a log to delete it. Your total points update automatically.
          </Text>
        </View>
      </View>
    );
  }
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