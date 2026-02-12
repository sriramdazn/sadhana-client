export const getUserPoints = async (token: string) => {
    console.log("get user details");
  
    const res = await fetch("http://localhost:8086/v1/user", {
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
  
  
  export const addUserPoints = async (
    token: string,
    todaysDate: string,
    sadanaId: string
  ) => {
  
    console.log("send sadhana details");
  
    const res = await fetch("http://localhost:8086/v1/sadana-tracker/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: todaysDate,
        sadanaId,
      }),
    });
  
    if (!res.ok) {
      throw new Error("Failed to add points");
    }
  
    return res.json();
  };