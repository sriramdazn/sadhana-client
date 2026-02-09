import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, List, Switch } from "@ant-design/react-native";
import Screen from "../../components/Screen";
import GlassCard from "../../components/GlassCard";
import { theme } from "../../constants/theme";

export default function SettingsScreen() {
  const [dailyDecayEnabled, setDailyDecayEnabled] = useState(true);

  return (
    <Screen>
      <View style={{ paddingTop: 6 }}>
        <Text style={styles.h}>Settings</Text>

        <GlassCard style={{ marginTop: 12 }}>
          <View style={{ height: 12 }} />
          <Button type="primary" style={styles.btn}>
            Sigin
          </Button>
          <View style={{ height: 10 }} />
          <Button type="warning" style={styles.btn}>
            Logout
          </Button>
        </GlassCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { color: theme.colors.text, fontSize: 22, fontWeight: "900", marginTop: 8 },
  itemText: { color: theme.colors.text, fontWeight: "900" },
  btn: { borderRadius: 14 },
});
