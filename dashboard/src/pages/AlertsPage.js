import { useEffect, useState } from "react";
import { fetchAlerts } from "../api/alerts";

function AlertsPage({ endpoint, method }) {
  const [alerts, setAlerts] = useState([]);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await fetchAlerts(endpoint, method);

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
      <h2>
        Alerts — {method} {endpoint}
      </h2>

      {impact !== null && (
        <div className="impact">
          ⚠ Breaking change may affect ~{impact}% of recent traffic
        </div>
      )}

      {alerts.length === 0 ? (
        <p>No alerts detected.</p>
      ) : (
        alerts.map((a) => (
          <div key={a.id} className="card" style={{ marginBottom: 12 }}>
            <strong>{a.change_type}</strong> — field: <b>{a.field}</b>

            <span className={`badge ${a.severity.toLowerCase()}`}>
              {a.severity}
            </span>

            <div style={{ fontSize: 12, marginTop: 6, color: "#6b7280" }}>
              {new Date(a.created_at).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AlertsPage;

