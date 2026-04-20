import { useEffect, useState } from "react";
import { fetchAlerts } from "../api/alerts";

function AlertsPage({ endpoint, method }) {
  const [alerts, setAlerts] = useState([]);
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAlerts(endpoint, method);
        setAlerts(data.alerts || []);
        setImpact(data.impact ?? null);
      } catch (err) {
        console.error("Alerts error:", err);
      }
    }
    load();
  }, [endpoint, method]);

  return (
    <div className="card">
      <h3>Alerts</h3>

      {impact !== null && (
        <div className="impact-hero">
          ⚠ ~{impact}% traffic affected
        </div>
      )}

      {alerts.length === 0 ? (
        <p>No alerts found</p>
      ) : (
        alerts.map((a) => (
          <div
            key={a.id}
            className={`alert-row ${a.severity.toLowerCase()}`}
          >
            <strong>{a.change_type}</strong> — {a.field}

            <span className={`badge ${a.severity.toLowerCase()}`}>
              {a.severity}
            </span>

            {a.occurrence_count > 1 && (
              <span style={{ marginLeft: 10 }}>
                ×{a.occurrence_count}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AlertsPage;