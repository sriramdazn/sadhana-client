import React from "react";
import { StyleSheet, Text, View } from "react-native";
import GlassCard from "@/components/GlassCard";
import { theme } from "@/constants/theme";
import Screen from "@/components/Screen";

export default function SettingsScreen() {
  return (
    <Screen>
      <View style={{ paddingTop: 6 }}>
        <Text style={styles.h}>Settings</Text>
        <GlassCard style={{ marginTop: 12 }}>
          <Text style={styles.p}>
            Next we can add: Sign in buttons, Sync to Cloud UI, daily points deduction UI.
          </Text>
        </GlassCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { color: theme.colors.text, fontSize: 22, fontWeight: "900", marginTop: 8 },
  p: { color: theme.colors.muted, fontWeight: "700", lineHeight: 20 },
});
