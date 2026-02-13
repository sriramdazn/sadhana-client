import AsyncStorage from "@react-native-async-storage/async-storage";
import { COMPLETED_KEY, HOME_DAY_KEY } from "@/constants/constant";
import { todayIso } from "@/utils/todayDate";

export async function resetTicksIfNewDay(setCompletedIds: (v: any) => void) {
  const today = todayIso();
  const savedDay = await AsyncStorage.getItem(HOME_DAY_KEY);
  
  if (savedDay !== today) {
    await AsyncStorage.multiSet([
      [HOME_DAY_KEY, today],
      [COMPLETED_KEY, JSON.stringify({})],
    ]);
    setCompletedIds({});
  }
}