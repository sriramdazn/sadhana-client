import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Input } from "@ant-design/react-native";
import Screen from "@/components/Screen";
import GlassCard from "@/components/GlassCard";
import { theme } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen: React.FC = () => {
  const [stage, setStage] = useState<"default" | "email" | "otp" | "done">(
    "default"
  );

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);

  const [isLoginFlow, setIsLoginFlow] = useState(false);

  const handleEmailSubmit = async () => {
    try {
      const res = await fetch("http://localhost:8086/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("Register API:", data);

      if (data.code === 400 && data.message === "Email already taken") {
        console.log("Email taken, Switching to Login Flow");

        const loginRes = await fetch("http://localhost:8086/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const loginData = await loginRes.json();
        console.log("Login API:", loginData);

        if (loginRes.ok && loginData.otpId) {
          setIsLoginFlow(true);
          setOtpId(loginData.otpId);
          setStage("otp");
        } else {
          alert(loginData.message || "Login failed");
        }

        return;
      }

      if (res.ok && data.otpId) {
        setIsLoginFlow(false);
        setOtpId(data.otpId);
        setStage("otp");
      } else {
        alert(data.message || "Failed to register email");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleOtpVerify = async () => {
    if (!otpId) {
      alert("Missing otpId");
      return;
    }

    const endpoint = isLoginFlow
      ? "http://localhost:8086/v1/auth/verify-login-email"
      : "http://localhost:8086/v1/auth/verify-register-email";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otpId,
          otp: Number(otp),
        }),
      });

      const data = await res.json();
      console.log("Verify Response:", data);

      if (res.ok) {
        await AsyncStorage.setItem("access_token", data.token);
        await AsyncStorage.setItem("user_id", data.user.id);
        await AsyncStorage.setItem("is_logged_in", "true");

        setStage("done");
      } else {
        alert(data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("is_logged_in");

    setEmail("");
    setOtp("");
    setOtpId(null);
    setStage("default");
    setIsLoginFlow(false);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <GlassCard style={styles.card}>
          <View style={styles.content}>
            {stage === "default" && (
              <Button
                type="primary"
                size="large"
                style={styles.mainButton}
                onClick={() => setStage("email")}
              >
                Save to Cloud
              </Button>
            )}

            {stage === "email" && (
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Enter Email</Text>

                <Input
                  placeholder="you@example.com"
                  size="large"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Button
                  type="primary"
                  size="large"
                  style={styles.mainButton}
                  onClick={handleEmailSubmit}
                >
                  Sign In
                </Button>
              </View>
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
                />

                <Button
                  type="primary"
                  size="large"
                  style={styles.mainButton}
                  onClick={handleOtpVerify}
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
  container: {
    flex: 1,
    paddingTop: 6,
  },

  title: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 8,
    textAlign: "center",
  },

  card: {
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
  },

  content: { gap: 16 },

  inputBlock: { gap: 12 },

  label: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
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
    backgroundColor: "#4a90e2",
    borderColor: "#4a90e2",
    borderRadius: 30,
    height: 48,
    fontSize: 18,
  },
});
