import axios from "axios";
import { getToken } from "../utils/auth";
import BASE_URL, { getProjectId } from "./config";

const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
  "x-project-id": getProjectId(),
});

export async function fetchTraffic(range = "24h") {
  const res = await axios.get(`${BASE_URL}/analytics/traffic`, {
    params: { range },
    headers: authHeader(),
  });
  return res.data;
}

export async function fetchAlertTrend(range = "24h") {
  const res = await axios.get(`${BASE_URL}/analytics/alerts-trend`, {
    params: { range },
    headers: authHeader(),
  });
  return res.data;
}

export async function fetchSeverity(range = "24h") {
  const res = await axios.get(`${BASE_URL}/analytics/severity`, {
    params: { range },
    headers: authHeader(),
  });
  return res.data;
}

export async function fetchTopEndpoints(range = "24h") {
  const res = await axios.get(`${BASE_URL}/analytics/top-endpoints`, {
    params: { range },
    headers: authHeader(),
  });
  return res.data;
}

export async function fetchInsights() {
  const res = await axios.get(`${BASE_URL}/analytics/insights`, {
    headers: authHeader(),
  });
  return res.data;
}