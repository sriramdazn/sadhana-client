import { API_BASE_URL } from "@/constants/api.constant";

export const getSadhanas = async () => {
  const response = await fetch(`${API_BASE_URL}/v1/sadanas`);
  const json = await response.json();

  return json.data;
};

