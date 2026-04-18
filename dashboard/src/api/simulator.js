import axios from "axios";
import BASE_URL, { getProjectId } from "./config";
import { getToken } from "../utils/auth";

export async function simulateRequest(payload) {
  const res = await axios.post(
    `${BASE_URL}/simulate`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "x-project-id": getProjectId(),
      },
    }
  );

  return res.data;
}