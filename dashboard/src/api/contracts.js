import axios from "axios";
import { getToken } from "../utils/auth";

const BASE_URL = "http://localhost:5000/api";

export async function fetchContracts(endpoint, method) {
  const response = await axios.get(`${BASE_URL}/contracts`, {
    params: { endpoint, method },
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
}