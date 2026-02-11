import React from "react";
import { StyleSheet } from "react-native";
import { Input, Button, Flex } from "antd";
import Screen from "./Screen";
import { theme } from "../constants/theme";

interface InputWithBtnProps {
  inputText: string;
  btnText: string;
  onButtonClick: () => void;
}

const InputWithBtn: React.FC<InputWithBtnProps> = ({
  inputText,
  btnText,
  onButtonClick,
}) => {
  return (
    <Screen>
      <Flex vertical align="center" justify="center" style={styles.centerBox}>
        <Flex vertical gap={12} style={styles.inner}>
          <Input placeholder={inputText} size="large" style={styles.input} />

          <Button
            type="primary"
            size="large"
            style={styles.button}
            onClick={onButtonClick}
          >
            {btnText}
          </Button>
        </Flex>
      </Flex>
    </Screen>
  );
};

export default InputWithBtn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    backgroundImage: "none",
  },
  centerBox: {
    flex: 1,
    width: "100%",
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 16,
  },
  inner: {
    width: "100%",
  },
  input: {
    width: "100%",
  },
  button: {
    width: "100%",
    backgroundColor: "#4a90e2",
    borderColor: "#4a90e2",
    borderRadius: 12,
  },
});
