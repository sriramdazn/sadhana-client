import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Button, Input } from "antd";
import Screen from "@/components/Screen";
import GlassCard from "@/components/GlassCard";
import { theme } from "@/constants/theme";
import { getUserId, requestEmailOtp, requestLogout, setDecayPoints, verifyEmailOtp } from "@/services/auth.service";
import { clearSession, getLastEmail, getSession, saveSession } from "@/utils/storage";
import DailyDecaySlider from "@/components/DailyDecaySlider";
import { useGuestStorage } from "@/hooks/useGuestStorage";
import { sadanaSyncPayload } from "@/utils/sadhanaPayload";

const SettingsScreen: React.FC = () => {
  const [stage, setStage] = useState<"default" | "email" | "otp" | "done">(
    "default"
  );

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [lastEmail, setLastEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dailyDecay, setDailyDecay] = useState<number>(50);

  useEffect(() => {
    getLastEmail().then((value) => {
      if (value) setLastEmail(value);
    });
    const {decayPoints} = getSession();
    setDailyDecay(decayPoints);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      console.log(session);
  
      if (session?.token && session.userId) {
        setStage("done");
      } else {
        setStage("default");
      }
    };
  
    checkSession();
   
  }, []);


  const setPoints = async (value: number) => {
    setDailyDecay(value);
  
    const session = await getSession();
    if (!session?.token) {
      console.log("Not logged in — skip API");
      return;
    }
  
    try {
      await setDecayPoints({ decayPoints: value }, session.token);
      await saveSession({
        decayPoints: value
      })
    } catch (e) {
      console.log("Failed to update decay points", e);
    }
  };
  


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
      const journey = await useGuestStorage.getJourney();
      console.log("jounery ",journey)
      const payload = sadanaSyncPayload({
        days: journey,
      });
      const res = await verifyEmailOtp({ otpId, otp: Number(otp), ...payload });
      const user = await getUserId(res.token);
      await saveSession({
        token: res.token,
        email,
        userId: user,
        isLoggedIn: true
      });

      setStage("done");
    } catch (err: any) {
      alert(err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

const handleLogout = async () => {
  try {
    setLoading(true);

    const session = await getSession();

    if (!session?.token) {
      alert("No active session found");
      setLoading(false);
      return;
    }

    await requestLogout(session.token);
    await clearSession();

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


    <View style={styles.inputBlock}>
      <DailyDecaySlider
  value={dailyDecay}
  onChange={setPoints}
  disabled={loading}
/>
    </View>

    {stage === "default" && (
      <Button
        type="primary"
        size="large"
        style={styles.mainButton}
        onClick={() => setStage("email")}
        loading={loading}
      >
        Save to Cloud
      </Button>
    )}

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

    {stage === "done" && (
      <Button
        type="primary"
        size="large"
        style={styles.mainButton}
        onClick={handleLogout}
      >
        Logout
      </Button>
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
  orLabel: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
    textAlign: "center",
  },
  input: {
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: theme.colors.border,
    borderWidth: 1,
    color: "#ffffff",
  },
  mainButton: {
    borderRadius: 30,
    height: 48,
    fontSize: 18,
    backgroundColor: "rgba(155, 93, 229, 0.95)"
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