import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHavingAccessToken, setIsHavingAccessToken] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const loggedInFlag = await AsyncStorage.getItem("is_logged_in");
        
        setIsHavingAccessToken(!!token);
        setIsLoggedIn(loggedInFlag === "true");
      } catch (err) {
        console.error("Error loading auth status", err);
      }
    };

    loadStatus();
  }, []);

  return {
    isLoggedIn,
    isHavingAccessToken,
  };
}
