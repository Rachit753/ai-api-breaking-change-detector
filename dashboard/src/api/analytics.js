import axios from "axios";
import { getToken } from "../utils/auth";

const BASE_URL = "http://localhost:5000/api";

export async function fetchTraffic(range = "24h") {
  const res = await axios.get(`${BASE_URL}/analytics/traffic`, {
    params: { range },
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  return res.data;
}