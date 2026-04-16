import axios from "axios";
import { getToken } from "../utils/auth";
import BASE_URL, { getProjectId } from "./config";

export async function fetchEndpoints() {
  const response = await axios.get(`${BASE_URL}/endpoints`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "x-project-id": getProjectId(),
    },
  });

  return response.data;
}
