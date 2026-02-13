import { API_BASE_URL } from "@/constants/api.constant";

export const getUserPoints = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch user");
    }
    return res.json();
  };
  
  
  // export const addUserPoints = async (
  //   token: string,
  //   todaysDate: string,
  //   sadanaId: string
  // ) => {
  
  //   const res = await fetch(`${API_BASE_URL}/v1/sadana-tracker`,{
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       date: todaysDate,
  //       sadanaId,
  //     }),
  //   });
  
  //   if (!res.ok) {
  //     throw new Error("Failed to add points");
  //   }
  
  //   return res.json();
  // };

  export const getTodayTracker = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/v1/sadana-tracker`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) {
      throw new Error("Failed to fetch tracker");
    }
  
    return res.json(); 
  };
  
  