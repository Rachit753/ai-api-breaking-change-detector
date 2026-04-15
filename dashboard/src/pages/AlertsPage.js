import { useEffect, useState } from "react";
import { fetchAlerts } from "../api/alerts";

function AlertsPage({ endpoint, method }) {
  const [alerts, setAlerts] = useState([]);
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await fetchAlerts(endpoint, method);
      setAlerts(data.alerts);
      setImpact(data.impact);
    }
    load();
  }, [endpoint, method]);

  return (
    <div className="card">
      <h3>Alerts</h3>

      {impact !== null && (
        <div className="impact">
          ⚠ ~{impact}% traffic affected
        </div>
      )}

      {alerts.map((a) => (
        <div key={a.id}>
          {a.change_type} — {a.field}
          <span className={`badge ${a.severity.toLowerCase()}`}>
            {a.severity}
          </span>
        </div>
      ))}
    </div>
  );
}

export default AlertsPage;