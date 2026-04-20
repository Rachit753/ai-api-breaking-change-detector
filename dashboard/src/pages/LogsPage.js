import { useEffect, useState } from "react";
import { fetchLogs } from "../api/logs";
import { motion, AnimatePresence } from "framer-motion";

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [openLog, setOpenLog] = useState(null);

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

  function toggle(id, type) {
    if (openLog?.id === id && openLog?.type === type) {
      setOpenLog(null);
    } else {
      setOpenLog({ id, type });
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

          <div
            className="log-toggle"
            onClick={() => toggle(log.id, "request")}
          >
            {openLog?.id === log.id && openLog?.type === "request"
              ? "▼ Request Body"
              : "▶ Request Body"}
          </div>

          <AnimatePresence>
            {openLog?.id === log.id && openLog?.type === "request" && (
              <motion.pre
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="code-block"
              >
                {JSON.stringify(log.request_body, null, 2)}
              </motion.pre>
            )}
          </AnimatePresence>

          <div
            className="log-toggle"
            onClick={() => toggle(log.id, "response")}
          >
            ▶ Response Body
          </div>

          <AnimatePresence>
            {openLog?.id === log.id &&
              openLog?.type === "response" && (
                <motion.pre
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="code-block"
                >
                  {JSON.stringify(log.response_body, null, 2)}
                </motion.pre>
              )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default LogsPage;