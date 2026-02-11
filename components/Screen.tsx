import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { theme } from "@/constants/theme";

export default function Screen({ children }: React.PropsWithChildren) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[theme.colors.bgTop, theme.colors.bgMid, theme.colors.bgBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safe}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bgBottom, padding: 15 },
  safe: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
});
