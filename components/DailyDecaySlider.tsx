import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Slider } from "antd";
import { FrownOutlined, SmileOutlined } from "@ant-design/icons";
import { theme } from "@/constants/theme";

type Props = {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  /** when true, shows a skeleton and defers rendering of the real UI */
  loading?: boolean;
};

const DailyDecaySlider: React.FC<Props> = ({
  value,
  onChange,
  disabled = false,
  loading = false,
}) => {
  const frownStyle: React.CSSProperties = {
    ...iconBase,
    ...(value < 50 ? iconActive : {}),
  };
  const smileStyle: React.CSSProperties = {
    ...iconBase,
    ...(value >= 50 ? iconActive : {}),
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Decay</Text>

      {loading ? (
        <View style={styles.row}>
          <View style={[styles.skeletonIcon]} />
          <View style={[styles.sliderWrapper]}>
            <View style={styles.skeletonTrack} />
            <View style={styles.skeletonText} />
          </View>
          <View style={[styles.skeletonIcon]} />
        </View>
      ) : (
        <View style={styles.row}>
          <FrownOutlined style={frownStyle} />
          <View style={styles.sliderWrapper}>
            <Slider
              min={0}
              max={100}
              step={25}
              value={value}
              onChange={(v) => onChange(Number(v))}
              disabled={disabled}
            />
            <Text style={styles.pointsText}>{value} pts</Text>
          </View>
          <SmileOutlined style={smileStyle} />
        </View>
      )}
    </View>
  );
};

export default DailyDecaySlider;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 10,
    gap: 8,
  },
  title: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
    textAlign: "center",
  },
  pointsText: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 13,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    minHeight: 52,
  },
  sliderWrapper: {
    flex: 1,
  },

  skeletonIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  skeletonTrack: {
    height: 22,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 6,
  },
  skeletonText: {
    height: 14,
    width: 60,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignSelf: "center",
  },
});

const iconBase: React.CSSProperties = {
  fontSize: 20,
  color: "rgba(255, 255, 255, 0.35)",
};

const iconActive: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.92)",
  textShadow: "0 0 6px rgba(74, 144, 226, 0.35)",
};
