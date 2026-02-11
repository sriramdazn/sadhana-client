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

  const isPrimary = confirmType === "primary";

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.modalCard} onPress={() => { }}>
          <Text style={styles.title}>{title}</Text>


          <View style={styles.actions}>
        <Button
          type="ghost"
          onPress={onCancel}
          style={{ ...styles.btnBase, ...styles.cancelBtn }}
         
        >
          <Text style={styles.cancelText}>{cancelText}</Text>
        </Button>

                  <Button
            type={confirmType}
            onPress={onConfirm}
            style={
              isPrimary
                ? { ...styles.btnBase, ...styles.confirmBtn } // HOME
                : styles.btnBase                               // JOURNEY 
            }
          >
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
    backgroundColor: "rgba(15,12,30,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,

    borderRadius: 22,

    backgroundColor: "rgba(42,36,78,0.96)",

    paddingVertical: 22,
    paddingHorizontal: 18,

    borderWidth: 1,
    borderColor: "rgba(155,93,229,0.35)",

    shadowColor: "#9B5DE5",
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },

    elevation: 20,
  },

  title: {
    color: "#F4F2FF",
    fontWeight: "700",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 18,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  btnBase: {
    flex: 1,
    height: 44,
    borderRadius: 18,
    justifyContent: "center",
  },

  cancelBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    
  },

  confirmBtn: {
    backgroundColor: "rgba(155,93,229,0.95)",
    borderWidth: 0,
    color: "red"
  },
  
  cancelText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 17
  }
});
