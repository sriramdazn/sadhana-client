import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/GlassCard";
import { theme } from "@/constants/theme";
import Screen from "@/components/Screen";
import Pill from "@/components/Pills";
import Rows from "@/components/Rows";
import { Icon } from "@ant-design/react-native";
import WeeklyPoints from "@/components/WeeklyPoints";

export default function HomeScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/(tabs)/settings")}>
            <Ionicons name="menu" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(tabs)/settings")} style={styles.avatarWrap}>
            <View style={styles.avatarWrap}>
              <Icon name="user" size={22} color="#F3F2FF" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.hello}>Hello, Jey</Text>

        {/* date pills */}
        <View style={styles.pillsRow}>
          <Pill label="Mon 8" />
          <Pill label="Tue 9" />
          <Pill label="Wed 10" />
          <Pill label="Thu 11" />
          <Pill label="Fri 12" active />
          <Pill label="Sat 13" />
          <Pill label="Sun 14" />
        </View>

        <Text style={styles.sectionTitle}>Today’s Sadhanas</Text>

        <GlassCard style={{ marginTop: 10 }}>
          <View style={{ gap: 12 }}>
            <Rows title="Morning Meditation" subtitle="7:30 AM" variant="peach" action="done" />
            <Rows title="Yoga Practice" subtitle="+15 pts" variant="coral" action="add" />
            <Rows title="Gratitude Journaling" subtitle="+10 pts" variant="sand" action="add" />
          </View>

          <View style={{ height: 14 }} />
          <WeeklyPoints />
        </GlassCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(243,242,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { width: "100%", height: "100%" },

  hello: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 24,
    marginTop: 6,
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: "row",
    paddingVertical: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
    marginTop: 8,
  },
});
