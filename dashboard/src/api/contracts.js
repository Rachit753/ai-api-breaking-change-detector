import axios from "axios";
import { getToken } from "../utils/auth";
import BASE_URL from "./config";

export async function fetchContracts(endpoint, method) {
  const response = await axios.get(`${BASE_URL}/contracts`, {
    params: { endpoint, method },
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
}