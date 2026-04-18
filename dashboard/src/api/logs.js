import axios from "axios";
import BASE_URL, { getProjectId } from "./config";
import { getToken } from "../utils/auth";

export async function fetchLogs(limit = 50) {
  const res = await axios.get(`${BASE_URL}/analytics/logs`, {
    params: { limit },
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "x-project-id": getProjectId(),
    },
  });

  return res.data;
}