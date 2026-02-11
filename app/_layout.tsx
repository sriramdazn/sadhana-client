import { useGuestSyncToBackend } from "../hooks/useGuestSyncToBackend";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? " api domain";

// session values
// const isLoggedIn = !!session;
// const userId = session?.user?.id ?? null;
// const accessToken = session?.access_token ?? null;

useGuestSyncToBackend({ isLoggedIn: false, userId: null, accessToken: null, apiBaseUrl: API_BASE });

