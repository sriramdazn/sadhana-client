import React from "react";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { AntDesign } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          borderTopColor: theme.colors.border,
          backgroundColor: "rgba(25,24,48,0.65)",
        },
        tabBarBackground: () => <BlurView intensity={18} tint="dark" style={{ flex: 1 }} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <AntDesign name="home" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="journey"
        options={{
          title: "Journey",
          tabBarIcon: ({ color, size }) => <AntDesign name="profile" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <AntDesign name="setting" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
