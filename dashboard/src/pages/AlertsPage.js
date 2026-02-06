import { useEffect, useState } from "react";
import { fetchAlerts } from "../api/alerts";

function severityColor(severity) {
  if (severity === "BREAKING") return "red";
  if (severity === "RISKY") return "orange";
  return "green";
}

function AlertsPage({ endpoint, method }) {
  const [alerts, setAlerts] = useState([]);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await fetchAlerts(endpoint, method);

        //backend now returns { alerts, impact }
        setAlerts(data.alerts || []);
        setImpact(data.impact ?? null);
      } catch (err) {
        console.error("Failed to load alerts:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, [endpoint, method]);

  if (loading) return <p>Loading alerts...</p>;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>
        Alerts — {method} {endpoint}
      </h3>

      {/* Impact Analysis Banner */}
      {impact !== null && (
        <div
          style={{
            background: "#fff3cd",
            padding: 10,
            marginBottom: 12,
            borderRadius: 6,
            fontWeight: "bold",
            border: "1px solid #ffeeba",
          }}
        >
          ⚠ Breaking change may affect ~{impact}% of recent traffic
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <p>No alerts detected.</p>
      ) : (
        <ul>
          {alerts.map((a) => (
            <li key={a.id} style={{ marginBottom: 10 }}>
              <strong>{a.change_type}</strong> — field: <b>{a.field}</b>{" "}
              <span
                style={{
                  color: "white",
                  background: severityColor(a.severity),
                  padding: "2px 8px",
                  borderRadius: 4,
                  marginLeft: 8,
                  fontSize: 12,
                }}
              >
                {a.severity}
              </span>

              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                {new Date(a.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AlertsPage;
