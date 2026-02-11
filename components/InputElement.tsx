
import React from "react";
import { StyleSheet, View } from "react-native";
import { Input } from "antd";

const styles = StyleSheet.create({
  h: { color: "#111", fontSize: 22, fontWeight: "900", marginTop: 8 },
  itemText: { color: "#111", fontWeight: "900" },
  btn: { borderRadius: 14 },
});

const InputElement: React.FC = () => (
  <View>
    <Input
      placeholder="Email"
      style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
    />
  </View>
);

export default InputElement;
