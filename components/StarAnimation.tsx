import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, Easing } from "react-native";

type Props = {
  visible: boolean;
  onComplete: () => void;
};

export default function StarAnimation({ visible, onComplete }: Props) {
  const starOpacity = useRef(new Animated.Value(0)).current;
  const starY = useRef(new Animated.Value(0)).current;

  const starX1 = useRef(new Animated.Value(0)).current;
  const starX2 = useRef(new Animated.Value(0)).current;
  const starX3 = useRef(new Animated.Value(0)).current;

  const dimOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    starOpacity.setValue(0);
    starY.setValue(0);
    starX1.setValue(0);
    starX2.setValue(0);
    starX3.setValue(0);
    dimOpacity.setValue(0);

    Animated.timing(dimOpacity, {
      toValue: 0.45,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(starOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),

      Animated.timing(starY, {
        toValue: -80,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.sequence([
        Animated.timing(starX1, { toValue: -20, duration: 200, useNativeDriver: true }),
        Animated.timing(starX1, { toValue: 20, duration: 200, useNativeDriver: true }),
        Animated.timing(starX1, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),

      Animated.sequence([
        Animated.timing(starX2, { toValue: 20, duration: 200, useNativeDriver: true }),
        Animated.timing(starX2, { toValue: -20, duration: 200, useNativeDriver: true }),
        Animated.timing(starX2, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),

      Animated.sequence([
        Animated.timing(starX3, { toValue: -15, duration: 200, useNativeDriver: true }),
        Animated.timing(starX3, { toValue: 15, duration: 200, useNativeDriver: true }),
        Animated.timing(starX3, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => {
      Animated.timing(starOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(dimOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onComplete();
        });
      });
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[styles.dimOverlay, { opacity: dimOpacity }]}
      />

      <View style={styles.starWrapper}>
        <Animated.Text style={[styles.star, {
          opacity: starOpacity,
          transform: [{ translateX: starX1 }, { translateY: starY }],
        }]}>✨</Animated.Text>

        <Animated.Text style={[styles.star, {
          opacity: starOpacity,
          transform: [{ translateX: starX2 }, { translateY: starY }],
        }]}>⭐</Animated.Text>

        <Animated.Text style={[styles.star, {
          opacity: starOpacity,
          transform: [{ translateX: starX3 }, { translateY: starY }],
        }]}>✨</Animated.Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  star: { fontSize: 42 },

  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0F0C1E",
    zIndex: 100,
  },

  starWrapper: {
    position: "absolute",
    top: 180,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    zIndex: 200,
  },
});
