import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export async function fetchAlerts(endpoint, method) {
  const response = await axios.get(`${BASE_URL}/alerts`, {
    params: { endpoint, method },
  });

  return response.data;
}
