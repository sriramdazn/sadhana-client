import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  accessToken: "access_token",
  isLoggedIn: "is_logged_in",
  userId: "user_id",
  userEmail: "user_email",
  decayPoints: "decay_points"
} as const;

export async function saveSession(opts: {
  token?: string;
  email?: string;
  userId?: string;
  isLoggedIn?: boolean;
  decayPoints?: number;
}) {
  const pairs: [string, string][] = [];

  if (opts.token !== undefined) {
    pairs.push([STORAGE_KEYS.accessToken, opts.token]);
  }
  if (opts.isLoggedIn !== undefined) {
    pairs.push([STORAGE_KEYS.isLoggedIn, String(opts.isLoggedIn)]);
  }
  if (opts.email !== undefined) {
    pairs.push([STORAGE_KEYS.userEmail, opts.email]);
  }
  if (opts.userId !== undefined) {
    pairs.push([STORAGE_KEYS.userId, opts.userId]);
  }
  if (opts.decayPoints !== undefined) {
    pairs.push([STORAGE_KEYS.decayPoints, String(opts.decayPoints)]);
  }

  if (pairs.length) {
    await AsyncStorage.multiSet(pairs);
  }
}

export async function clearSession() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.isLoggedIn,
    STORAGE_KEYS.userEmail,
    STORAGE_KEYS.userId,
    STORAGE_KEYS.decayPoints,
  ]);
}

export async function getSession() {
  const [[, token], [, email], [, userId], [, isLoggedIn], [, decayPoints]] =
    await AsyncStorage.multiGet([
      STORAGE_KEYS.accessToken,
      STORAGE_KEYS.userEmail,
      STORAGE_KEYS.userId,
      STORAGE_KEYS.isLoggedIn,
      STORAGE_KEYS.decayPoints,
    ]);

  return {
    token: token ?? undefined,
    email: email ?? undefined,
    userId: userId ?? undefined,
    isLoggedIn: isLoggedIn === "true",
    decayPoints: decayPoints ? Number(decayPoints) : undefined,
  };
}

export async function getLastEmail() {
  const v = await AsyncStorage.getItem(STORAGE_KEYS.userEmail);
  return v || null;
}