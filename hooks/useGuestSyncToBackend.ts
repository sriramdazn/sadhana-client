import { useEffect, useRef } from "react";
import { useGuestStorage } from "./useGuestStorage";
import { useAuthStatus } from "./useAuthStatus";
import { API_BASE_URL } from "@/constants/api.constant";
import { sadanaSyncPayload } from "@/utils/sadhanaPayload";

async function postJson(url: string, token: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Sync failed (${res.status})`);
  }
}

export function useGuestSyncToBackend() {
  const didRunRef = useRef(false);
  const { userId, isLoggedIn, accessToken } = useAuthStatus();

  useEffect(() => {
    if (!isLoggedIn) return;
    if (!userId || !accessToken) return;

    // prevent re-renders
    if (didRunRef.current) return;
    didRunRef.current = true;

    (async () => {
      // If already synced for this user, skip
      const alreadySynced = await useGuestStorage.wasSyncedForUser(userId);
      if (alreadySynced) return;

      // Read guest data
      const journey = await useGuestStorage.getJourney();
      console.log("jounery ",journey)
      const payload = sadanaSyncPayload({
        days: journey,
      });
      console.log("journey ",payload);

      // If nothing to sync, just synced
      if (!payload) {
        await useGuestStorage.markSyncedForUser(userId);
        return;
      }

      await postJson(`${API_BASE_URL}/v1/sadhana/sync`, accessToken, {
        payload
      });

      // Mark synced & clear guest cache
      await useGuestStorage.markSyncedForUser(userId);
      await useGuestStorage.clearGuestData();
    })().catch(() => {
      // If sync fails, keep guest data
      didRunRef.current = false;
    });
  }, [isLoggedIn, userId, accessToken, API_BASE_URL]);
}
