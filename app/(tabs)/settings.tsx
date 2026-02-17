import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Button, Input } from "antd";
import Screen from "@/components/Screen";
import GlassCard from "@/components/GlassCard";
import { theme } from "@/constants/theme";
import {
  requestEmailOtp,
  requestLogout,
  setDecayPoints,
  setResetUser,
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
import {
  COMPLETED_KEY,
  HOME_DAY_KEY,
  JOURNEY_KEY,
  TOTAL_POINTS_KEY,
} from "@/constants/constant";
import { todayIso } from "@/utils/todayDate";
import OtpBox from "@/components/OtpBox";
import { useGuestStorage } from "@/hooks/useGuestStorage";
import Dialog from "@/components/Dialog";
import { useFocusEffect } from "expo-router";

const DEFAULT_DECAY = -50;

type LoadingAction = "otp" | "logout" | "reset" | "decay" | null;

const SkeletonButton: React.FC = () => <View style={styles.skeletonButton} />;

export type TStage = "default" | "email" | "otp" | "done";

const SettingsScreen: React.FC = () => {
  const [stage, setStage] = useState<TStage>("default");
  const [email, setEmail] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [lastEmail, setLastEmail] = useState<string | null>(null);
  const [dailyDecay, setDailyDecay] = useState<number>(DEFAULT_DECAY);
  const [hydrated, setHydrated] = useState(false);
  const { refresh } = useAuthStatus();
  const patchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const otpControllerRef = useRef<AbortController | null>(null);
  const resetControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    getLastEmail().then((value) => value && setLastEmail(value));
  }, []);

  useEffect(() => {
    const init = async () => {
      const session = await getSession();
      setStage(session?.token && session.userId ? "done" : "default");
      setDailyDecay(
        typeof session?.decayPoints === "number"
          ? session.decayPoints
          : DEFAULT_DECAY
      );
      setHydrated(true);
    };
    init();
    return () => {
      if (patchTimer.current) clearTimeout(patchTimer.current);
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setShowPopup(false);
    }, [])
  );

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

  const abortAndClear = (ref: React.MutableRefObject<AbortController | null>) => {
    ref.current?.abort();
    ref.current = null;
  };

  const newController = (ref: React.MutableRefObject<AbortController | null>): AbortController => {
    abortAndClear(ref);
    const ctrl = new AbortController();
    ref.current = ctrl;
    return ctrl;
  };

  const handlePopupCancel = () => {
    abortAndClear(otpControllerRef);
    setShowPopup(false);
    setStage("default");
    setEmail("");
    setOtpId(null);
  };

  const requestOtp = async (targetEmail: string) => {
    const { signal } = newController(otpControllerRef);
    setLoadingAction("otp");
    try {
      const res = await requestEmailOtp(targetEmail, signal);
      if (signal.aborted) return;
      setEmail(targetEmail);
      setOtpId(res.otpId);
      setStage("otp");
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      alert(err?.message || "Failed to request OTP");
    } finally {
      setLoadingAction(null);
    }
  };


  const setPoints = async (value: number) => {
    setDailyDecay(value);
    await saveSession({ decayPoints: value });
    if (patchTimer.current) clearTimeout(patchTimer.current);
    patchTimer.current = setTimeout(async () => {
      try {
        const session = await getSession();
        if (!session?.token) return;
        setLoadingAction("decay");
        await setDecayPoints({ decayPoints: value }, session.token);
        await saveSession({ ...session, decayPoints: value });
      } catch (e) {
        console.log("Failed to update decay points", e);
      } finally {
        setLoadingAction(null);
      }
    }, 400);
  };


  const handleLogout = async () => {
    setLoadingAction("logout");
    try {
      const session = await getSession();
      if (session?.token) await requestLogout(session.token);
      await clearSession();
      await saveSession({ decayPoints: -50, isLoggedIn: false });
      await AsyncStorage.multiSet([
        [COMPLETED_KEY, JSON.stringify({})],
        [TOTAL_POINTS_KEY, "0"],
        [HOME_DAY_KEY, todayIso()],
      ]);
      await AsyncStorage.multiRemove([
        HOME_DAY_KEY,
        JOURNEY_KEY,
        useGuestStorage.KEYS.home,
        useGuestStorage.KEYS.journey,
      ]);
      setDailyDecay(-50);
      emitAuthChanged();
      refresh();
      setEmail("");
      setOtpId(null);
      setStage("default");
    } catch (err: any) {
      alert(err?.message || "Logout failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetUser = async () => {
    const { signal } = newController(resetControllerRef);
    setLoadingAction("reset");
    try {
      const session = await getSession();
      if (signal.aborted) return;
      if (session?.token) await setResetUser(session.token, signal);
      if (signal.aborted) return;

      await saveSession({ decayPoints: -50, isLoggedIn: false });
      await AsyncStorage.multiSet([
        [COMPLETED_KEY, JSON.stringify({})],
        [TOTAL_POINTS_KEY, "0"],
        [HOME_DAY_KEY, todayIso()],
      ]);
      await AsyncStorage.multiRemove([
        HOME_DAY_KEY,
        JOURNEY_KEY,
        useGuestStorage.KEYS.home,
        useGuestStorage.KEYS.journey,
      ]);
      setDailyDecay(-50);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      alert(err?.message || "Reset failed");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <GlassCard style={styles.card}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Decay</Text>
              <Text style={styles.sectionDescription}>
                Adjust how many points you lose automatically every day.
              </Text>
            </View>
            <View style={styles.sliderCard}>
              <DailyDecaySlider
                value={dailyDecay}
                onChange={setPoints}
                disabled={loadingAction === "decay"}
                loading={!hydrated}
              />
            </View>
          </View>
        </GlassCard>

        <GlassCard style={{ ...styles.card, ...styles.accountCard }}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Account</Text>
              <Text style={styles.sectionDescription}>
                Cloud backup, logout & reset options.
              </Text>
            </View>

            <View style={styles.buttonsWrapper}>
              {!hydrated ? (
                <SkeletonButton />
              ) : stage === "default" ? (
                <Button
                  type="primary"
                  size="large"
                  style={styles.mainButton}
                  onClick={() => {
                    setStage("email");
                    setShowPopup(true);
                  }}
                  loading={loadingAction === "otp"}
                >
                  Save to Cloud
                </Button>
              ) : stage === "done" ? (
                <Button
                  type="primary"
                  size="large"
                  style={styles.mainButton}
                  onClick={handleLogout}
                  loading={loadingAction === "logout"}
                >
                  Logout
                </Button>
              ) : null}

              <Button
                type="primary"
                size="large"
                style={styles.resetButton}
                onClick={() => setShowResetDialog(true)}
                loading={loadingAction === "reset"}
              >
                Reset
              </Button>
            </View>
          </View>
        </GlassCard>

        <Dialog
          visible={showPopup}
          onCancel={handlePopupCancel}
        >
          {stage === "email" && (
            <>
              {lastEmail && (
                <Pressable
                  style={styles.ctaCard}
                  onPress={() => requestOtp(lastEmail)}
                >
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
                  disabled={loadingAction === "otp"}
                />
                <Button
                  type="primary"
                  size="large"
                  style={styles.mainButton}
                  onClick={() => requestOtp(email)}
                  loading={loadingAction === "otp"}
                >
                  Sign In
                </Button>
              </View>
            </>
          )}

          {stage === "otp" && (
            <OtpBox
              email={email}
              otpId={otpId}
              dailyDecay={dailyDecay}
              onControllerReady={(ctrl) => { otpControllerRef.current = ctrl; }}
              onSetDailyDecay={(v) => setDailyDecay(v)}
              onSetStage={(v) => {
                if (v === "done") {
                  setShowPopup(false);
                  setStage("done");
                } else {
                  abortAndClear(otpControllerRef);
                  setStage(v);
                }
              }}
            />
          )}
        </Dialog>

        <Dialog
          visible={showResetDialog}
          onCancel={() => {
            abortAndClear(resetControllerRef);
            setShowResetDialog(false);
          }}
        >
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Are you sure you want to reset all user data?
            </Text>
            <Button
              type="primary"
              size="large"
              style={styles.mainButton}
              loading={loadingAction === "reset"}
              onClick={async () => {
                await handleResetUser();
                setShowResetDialog(false);
              }}
            >
              Confirm
            </Button>
          </View>
        </Dialog>
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
  card: { marginTop: 16, padding: 10, borderRadius: 16 },
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
  resetBtn: { marginTop: 15 },
  buttonArea: { width: "100%" },
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
  sectionBlock: { paddingVertical: 10, gap: 16 },
  decayBlock: { marginBottom: 100 },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  sectionDescription: {
    color: theme.colors.muted,
    fontSize: 14,
    marginBottom: 8,
  },
  sliderCard: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  buttonsWrapper: { marginTop: 4, gap: 14 },
  resetButton: {
    borderRadius: 30,
    height: 48,
    fontSize: 18,
    backgroundColor: "rgba(255, 90, 90, 0.85)",
  },
  sectionContainer: { gap: 18 },
  sectionHeader: { gap: 6 },
  accountCard: { marginTop: 28 },
});
