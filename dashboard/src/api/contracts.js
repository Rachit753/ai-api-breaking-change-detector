import axios from "axios";
import { getToken } from "../utils/auth";
import BASE_URL, { getProjectId } from "./config";

export async function fetchContracts(endpoint, method) {
  const response = await axios.get(`${BASE_URL}/contracts`, {
    params: { endpoint, method },
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "x-project-id": getProjectId(),
    },
  });

  return response.data;
}