import { useEffect, useState } from "react";
import { fetchLogs } from "../api/logs";

function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await fetchLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load logs", err);
    }
  }

  return (
    <div>
      <h2>Request Logs</h2>

      {logs.map((log) => (
        <div key={log.id} className="card">
          <div>
            <strong>{log.method}</strong> — {log.endpoint}
          </div>

          <div>Status: {log.status_code}</div>
          <div>
            Time: {new Date(log.created_at).toLocaleString()}
          </div>

          <details>
            <summary>Request Body</summary>
            <pre>{JSON.stringify(log.request_body, null, 2)}</pre>
          </details>

          <details>
            <summary>Response Body</summary>
            <pre>{JSON.stringify(log.response_body, null, 2)}</pre>
          </details>
        </div>
      ))}
    </div>
  );
}

export default LogsPage;