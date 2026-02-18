import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  Pressable,
  Text,
  View,
} from "react-native";
import Screen from "./Screen";
import { theme } from "../constants/theme";

interface InputWithBtnProps {
  inputText: string;
  btnText: string;
  onButtonClick: (value: string) => void; // updated: pass input value
  initialValue?: string;
  disabled?: boolean;
  loading?: boolean;
}

const InputWithBtn: React.FC<InputWithBtnProps> = ({
  inputText,
  btnText,
  onButtonClick,
  initialValue = "",
  disabled = false,
  loading = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const isDisabled = disabled || loading;

  return (
    <Screen>
      <View style={styles.centerBox}>
        <View style={styles.inner}>
          <TextInput
            placeholder={inputText}
            placeholderTextColor={theme.colors.muted ?? "rgba(255,255,255,0.6)"}
            value={value}
            onChangeText={setValue}
            style={styles.input}
            editable={!isDisabled}
            autoCapitalize="none"
          />

          <Pressable
            onPress={isDisabled ? undefined : () => onButtonClick(value)}
            style={({ pressed }) => [
              styles.button,
              isDisabled && styles.buttonDisabled,
              pressed && !isDisabled && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
          >
            <Text style={styles.buttonText}>
              {loading ? "Loading..." : btnText}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
};

export default InputWithBtn;

const styles = StyleSheet.create({
  centerBox: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  inner: {
    width: "100%",
    gap: 12,
  },

  input: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border ?? "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: theme.colors.text ?? "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  button: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a90e2",
  },

  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
});
