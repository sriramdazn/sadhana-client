import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuthStatus() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem("user_id");
        const token = await AsyncStorage.getItem("access_token");
        const loggedInFlag = await AsyncStorage.getItem("is_logged_in");
        
        setUserId(userToken);
        setAccessToken(token);
        setIsLoggedIn(loggedInFlag === "true");
      } catch (err) {
        console.error("Error loading auth status", err);
      }
    };

    loadStatus();
  }, []);

  return {
    userId,
    isLoggedIn,
    accessToken,
  };
}
