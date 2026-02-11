import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  accessToken: "access_token",
  isLoggedIn: "is_logged_in",
  userId: "user_id",
  userEmail: "user_email",
} as const;

export async function saveSession(opts: { token: string; email?: string }) {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.accessToken, opts.token],
    [STORAGE_KEYS.isLoggedIn, "true"],
    [STORAGE_KEYS.userEmail, opts.email ?? ""],
  ]);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.isLoggedIn,
    STORAGE_KEYS.userEmail,
  ]);
}

export async function getLastEmail() {
  const v = await AsyncStorage.getItem(STORAGE_KEYS.userEmail);
  return v || null;
}