export const getSadhanas = async () => {
  const response = await fetch("http://localhost:8086/v1/sadanas");
  const json = await response.json();

  return json.data;
};
