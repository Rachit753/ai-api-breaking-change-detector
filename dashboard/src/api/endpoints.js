import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export async function fetchEndpoints() {
  const response = await axios.get(`${BASE_URL}/endpoints`);
  return response.data;
}
