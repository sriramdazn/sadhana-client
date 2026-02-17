import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@ant-design/react-native";
import { theme } from "@/constants/theme";

type Props = {
  visible: boolean;
  title?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmType?: "primary" | "warning" | "ghost";
  children?: React.ReactNode; 
};

export default function Dialog({
  visible,
  title,
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
  confirmType = "warning",
  children
}: Props) {

  const isPrimary = confirmType === "primary";
  const {height} = Dimensions.get("window");
  const slideAnimation = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if(visible){
      slideAnimation.setValue(height)
      Animated.timing(slideAnimation,{
        toValue: 0 ,
        duration: 250,
        useNativeDriver: true
      }).start();
    }
    else{
      Animated.timing(slideAnimation,{
        toValue: 300 ,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  },[visible])

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable onPress={() => { }}>
        <Animated.View style={[ styles.modalCard, { transform: [{ translateY: slideAnimation}] },]} >
          <Text style={styles.title}>{title}</Text>

          {children && <View >{children}</View>}

          {onConfirm && (

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
                ? { ...styles.btnBase, ...styles.confirmBtn }
                : styles.btnBase                       
            }
          >
            {confirmText}
          </Button>

      </View>
     )}

        </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalCard: {
    width: Dimensions.get("window").width - 40,

    borderRadius: 12,

    backgroundColor: "rgba(42,36,78,0.96)",

    paddingVertical: 28,
    paddingHorizontal: 18,

    borderWidth: 1,
    borderColor: "rgba(155,93,229,0.35)",

    shadowColor: "#9B5DE5",
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },

    elevation: 20,
    marginBottom: 80
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,12,30,0.75)",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 0,
    paddingBottom: 0,
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
    color: "red",
  },

  cancelText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 17,
  },
});
