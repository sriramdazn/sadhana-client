import { useMemo } from "react";
import { Repository } from "@/app/features/sadhana/repository";
import { createLocalRepository } from "@/app/features/sadhana/localRepository";
import { createRemoteRepository } from "@/app/features/sadhana/remoteRepository";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "api/sadhana";

export function useSadhanaRepo(): Repository {
  const { isLoggedIn, accessToken } = useSession();

  return useMemo(() => {
    if (!isLoggedIn || !accessToken) {
      return createLocalRepository();
    }

    return createRemoteRepository({
      baseUrl: API_BASE,
      accessToken,
    });
  }, [isLoggedIn, accessToken]);
}
