import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@ant-design/react-native";
import { theme } from "@/constants/theme";

type Props = {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmType?: "primary" | "warning" | "ghost";
};

export default function Dialog({
  visible,
  title,
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
  confirmType = "warning",
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.actions}>
            <Button type="ghost" onPress={onCancel} style={styles.btn}>
              {cancelText}
            </Button>
            <Button type={confirmType} onPress={onConfirm} style={styles.btn}>
              {confirmText}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(25,24,48,0.95)",
    padding: 16,
  },
  title: { color: theme.colors.text, fontWeight: "900", fontSize: 18, textAlign: "center" },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  btn: { flex: 1, borderRadius: 14 },
});
