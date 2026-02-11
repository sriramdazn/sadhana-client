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
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",

        tabBarStyle: {
          position: "absolute",

          // left: 16,
          // right: 16,
          // bottom: 16,

          height: 65,

          borderRadius: 24,
          borderTopColor: "rgba(25,24,48,0.7)",

          backgroundColor: "rgba(25,24,48,0.7)",

         

          elevation: 12, 

          
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        },

        tabBarItemStyle: {
          paddingVertical: 6,
        },

        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "600",
          marginBottom: 4,
        },

        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              flex: 1,
              borderRadius: 10,
              overflow: "hidden",
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign
              name="home"
              size={focused ? size + 4 : size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="journey"
        options={{
          title: "Journey",
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign
              name="profile"
              size={focused ? size + 4 : size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign
              name="setting"
              size={focused ? size + 4 : size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
