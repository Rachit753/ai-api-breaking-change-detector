import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export async function fetchContracts(endpoint, method) {
  const response = await axios.get(`${BASE_URL}/contracts`, {
    params: { endpoint, method },
  });

  return response.data;
}
