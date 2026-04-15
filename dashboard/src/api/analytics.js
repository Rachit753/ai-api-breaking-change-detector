import axios from "axios";
import { getToken } from "../utils/auth";

const BASE_URL = "http://localhost:5000/api";

export async function fetchTraffic(range = "24h") {
  const res = await axios.get(`${BASE_URL}/analytics/traffic`, {
    params: { range },
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
}

export async function fetchAlertTrend(range = "24h") {
  const res = await axios.get(`${BASE_URL}/analytics/alerts-trend`, {
    params: { range },
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
}

export async function fetchSeverity(range = "24h") {
  const res = await axios.get(`${BASE_URL}/analytics/severity`, {
    params: { range },
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
}

export async function fetchTopEndpoints(range = "24h") {
  const res = await axios.get(`${BASE_URL}/analytics/top-endpoints`, {
    params: { range },
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
}