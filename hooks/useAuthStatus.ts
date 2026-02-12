import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthChanged } from "@/utils/authEvents";

export function useAuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = await AsyncStorage.getItem("access_token");
    const flag = await AsyncStorage.getItem("is_logged_in");
    const user = await AsyncStorage.getItem("user_id");

    setUserId(user);
    setAccessToken(token);
    setIsLoggedIn(flag === "true" && !!token);
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
    const unsub = onAuthChanged(() => {
      refresh().catch(() => {});
    });
    return unsub;
  }, [refresh]);

  return { isLoggedIn, accessToken, userId, refresh };
}
