import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Button, Input } from "antd";
import Screen from "@/components/Screen";
import GlassCard from "@/components/GlassCard";
import { theme } from "@/constants/theme";
import {
  getUserId,
  requestEmailOtp,
  requestLogout,
  setDecayPoints,
  verifyEmailOtp,
} from "@/services/auth.service";
import {
  clearSession,
  getLastEmail,
  getSession,
  saveSession,
} from "@/utils/storage";
import DailyDecaySlider from "@/components/DailyDecaySlider";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { emitAuthChanged } from "@/utils/authEvents";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COMPLETED_KEY, HOME_DAY_KEY, JOURNEY_KEY, TOTAL_POINTS_KEY } from "@/constants/constant";
import { todayIso } from "@/utils/todayDate";

const DEFAULT_DECAY = 50;

const SkeletonButton: React.FC = () => (
  <View style={styles.skeletonButton} />
);

const SettingsScreen: React.FC = () => {
  const [stage, setStage] = useState<"default" | "email" | "otp" | "done">(
    "default"
  );

  const [email, setEmail] = useState("");

  
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [lastEmail, setLastEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dailyDecay, setDailyDecay] = useState<number>(DEFAULT_DECAY);
  const [hydrated, setHydrated] = useState(false);

  const { refresh } = useAuthStatus();

  const patchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getLastEmail().then((value) => {
      if (value) setLastEmail(value);
    });
  }, []);

  /** Hydrate slider value + stage exactly once */
  useEffect(() => {
    const init = async () => {
      const session = await getSession();

      if (session?.token && session.userId) {
        setStage("done");
      } else {
        setStage("default");
      }

      // Always hydrate slider from local storage
      if (typeof session.decayPoints === "number") {
        setDailyDecay(session.decayPoints);
      } else {
        setDailyDecay(DEFAULT_DECAY);
      }

      setHydrated(true); // allow slider & button area to render (no flicker)
    };

    init();

    return () => {
      if (patchTimer.current) clearTimeout(patchTimer.current);
    };
  }, []);

  const masked = useMemo(
    () => (lastEmail ? maskEmail(lastEmail) : ""),
    [lastEmail]
  );

  function maskEmail(email: string) {
    return email.replace(
      /^(.)(.*)(.@.*)$/,
      (_, a, b, c) => a + b.replace(/./g, "*") + c
    );
  }

  /** Slider change handler:
   *  - Update UI immediately
   *  - Persist locally always (guest + logged-in use the same key)
   *  - If logged in, debounce PATCH to server
   */
  const setPoints = async (value: number) => {
    setDailyDecay(value);

    // Persist locally as single source of truth
    await saveSession({ decayPoints: value });

    // Debounce PATCH when logged in
    if (patchTimer.current) clearTimeout(patchTimer.current);
    patchTimer.current = setTimeout(async () => {
      try {
        const session = await getSession();
        if (!session?.token) return; // logged out — skip API

        await setDecayPoints({ decayPoints: value }, session.token);

        // Keep session in sync
        await saveSession({
          token: session.token,
          email: session.email,
          userId: session.userId,
          isLoggedIn: session.isLoggedIn,
          decayPoints: value,
        });
      } catch (e) {
        console.log("Failed to update decay points", e);
      }
    }, 400);
  };

  const requestOtp = async (targetEmail: string) => {
    setLoading(true);
    try {
      const res = await requestEmailOtp(targetEmail);
      setEmail(targetEmail);
      setOtpId(res.otpId);
      setStage("otp");
    } catch (err: any) {
      alert(err?.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleUseLastEmail = () => {
    if (!lastEmail) return;
    requestOtp(lastEmail);
  };

  const handleUseNewEmail = () => {
    if (!/.+@.+\..+/.test(email)) {
      alert("Please enter a valid email");
      return;
    }
    requestOtp(email);
  };

  const handleOtpVerify = async () => {
    if (!otpId) {
      alert("Missing otpId");
      return;
    }
    if (!/^\d{4,6}$/.test(otp)) {
      alert("Enter valid OTP");
      return;
    }
    setLoading(true);
    try {
      const preSession = await getSession();
      const storedDecay = preSession.decayPoints;

      const res = await verifyEmailOtp({ otpId, otp: Number(otp) });
      const user = await getUserId(res.token);

      // Save basic session first
      await saveSession({
        token: res.token,
        email,
        userId: user.id,
        isLoggedIn: true,
      });

      // Prefer locally stored decay; else server; else current UI
      let nextDecay =
        typeof storedDecay === "number"
          ? storedDecay
          : typeof user.decayPoints === "number"
          ? user.decayPoints
          : dailyDecay;

      try {
        // Push preferred value to server
        await setDecayPoints({ decayPoints: nextDecay }, res.token);
      } catch (pushErr) {
        console.log("Failed pushing local decay", pushErr);
        // fallback to server value if available
        if (typeof user.decayPoints === "number") {
          nextDecay = user.decayPoints;
        }
      }

      // Persist final decay & update UI
      await saveSession({
        token: res.token,
        email,
        userId: user.id,
        isLoggedIn: true,
        decayPoints: nextDecay,
      });
      setDailyDecay(nextDecay);

      emitAuthChanged();
      setStage("done");

      // Optional debug
      const check = await AsyncStorage.multiGet([
        "is_logged_in",
        "access_token",
        "user_id",
      ]);
      console.log("Settings, CHECK:", check);
    } catch (err: any) {
      alert(err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  /** Logout:
   *  - Logout (if token exists)
   *  - Clear session keys
   *  - Re-save only decayPoints (keep guest continuity)
   */
  const handleLogout = async () => {
    try {
      setLoading(true);
      const session = await getSession();
      if (session?.token) {
        await requestLogout(session.token);
      }

      await clearSession();
      await saveSession({ decayPoints: dailyDecay, isLoggedIn: false });
      await AsyncStorage.multiSet([
        [COMPLETED_KEY, JSON.stringify({})],
        [TOTAL_POINTS_KEY, "50"], 
        [HOME_DAY_KEY, todayIso()],
      ]);
      await AsyncStorage.removeItem(JOURNEY_KEY);
      emitAuthChanged();

      setEmail("");
      setOtp("");
      setOtpId(null);
      setStage("default");
    } catch (err: any) {
      alert(err?.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <GlassCard style={styles.card}>
          <View style={styles.content}>
            {/* Slider with skeleton while hydrating/loading */}
            <DailyDecaySlider
              value={dailyDecay}
              onChange={setPoints}
              disabled={loading}
              loading={!hydrated || loading}
            />

         
<View style={styles.buttonArea}>
  {!hydrated ? (
    <SkeletonButton />   // show skeleton ONLY during first load
  ) : stage === "default" ? (
    <Button
      type="primary"
      size="large"
      style={styles.mainButton}
      onClick={() => setStage("email")}
      loading={loading}
    >
      Save to Cloud
    </Button>
  ) : stage === "done" ? (
    <Button
      type="primary"
      size="large"
      style={styles.mainButton}
      onClick={handleLogout}
      loading={loading}
    >
      Logout
    </Button>
  ) : null}
</View>

            {stage === "email" && (
              <>
                {lastEmail && (
                  <Pressable style={styles.ctaCard} onPress={handleUseLastEmail}>
                    <Text style={styles.ctaTitle}>Continue as</Text>
                    <Text style={styles.ctaEmail}>{masked}</Text>
                  </Pressable>
                )}

                <View style={styles.inputBlock}>
                  <Text style={styles.label}>Enter Email</Text>

                  <Input
                    placeholder="you@example.com"
                    size="large"
                    style={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />

                  <Button
                    type="primary"
                    size="large"
                    style={styles.mainButton}
                    onClick={handleUseNewEmail}
                    loading={loading}
                  >
                    Sign In
                  </Button>
                </View>
              </>
            )}

            {stage === "otp" && (
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Enter OTP</Text>

                <Input
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  size="large"
                  style={styles.input}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                />

                <Button
                  type="primary"
                  size="large"
                  style={styles.mainButton}
                  onClick={handleOtpVerify}
                  loading={loading}
                >
                  Verify
                </Button>
              </View>
            )}
          </View>
        </GlassCard>
      </View>
    </Screen>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 6 },
  title: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 8,
    textAlign: "center",
  },
  card: { marginTop: 16, padding: 20, borderRadius: 16 },
  content: { gap: 16 },
  inputBlock: { gap: 10 },
  label: { color: theme.colors.text, fontWeight: "900", fontSize: 16 },
  input: {
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: theme.colors.border,
    borderWidth: 1,
    color: "#fff",
  },
  mainButton: {
    borderRadius: 30,
    height: 48,
    fontSize: 18,
    backgroundColor: "rgba(155, 93, 229, 0.95)",
  },
  buttonArea: {
    width: "100%",
  },
  skeletonButton: {
    height: 48,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  ctaCard: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginBottom: 20,
  },
  ctaTitle: { color: theme.colors.muted, fontSize: 14, marginLeft: 4 },
  ctaEmail: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 4,
  },
});