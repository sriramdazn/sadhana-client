export const getSadhanas = async () => {
  const response = await fetch("https://server-04mx.onrender.com/v1/sadanas");
  const json = await response.json();

  return json.data;
};
