import axios from "axios";
import { getToken } from "../utils/auth";

const BASE_URL = "http://localhost:5000/api";

export async function fetchEndpoints() {
  const response = await axios.get(`${BASE_URL}/endpoints`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
}
