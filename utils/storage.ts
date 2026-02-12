import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  accessToken: "access_token",
  isLoggedIn: "is_logged_in",
  userId: "user_id",
  userEmail: "user_email",
} as const;

export async function saveSession(opts: { token: string; email?: string, userId?: string, isLoggedIn: boolean }) {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.accessToken, opts.token],
    [STORAGE_KEYS.isLoggedIn, opts.isLoggedIn],
    [STORAGE_KEYS.userEmail, opts.email ?? ""],
    [STORAGE_KEYS.userId, opts.userId ?? ""]
  ]);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.isLoggedIn,
    STORAGE_KEYS.userEmail,
    STORAGE_KEYS.userId
  ]);
}

export async function getSession() {
  const [token, email, userId, isLoggedIn] = await AsyncStorage.multiGet([
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.userEmail,
    STORAGE_KEYS.userId,
    STORAGE_KEYS.isLoggedIn,
  ]);

  return {
    token: token?.[1] || null,
    email: email?.[1] || null,
    userId: userId?.[1] || null,
    isLoggedin: isLoggedIn?.[1] || null
  };
}

export async function getLastEmail() {
  const v = await AsyncStorage.getItem(STORAGE_KEYS.userEmail);
  return v || null;
}