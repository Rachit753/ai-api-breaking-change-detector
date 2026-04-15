import { useEffect, useState } from "react";
import { fetchEndpoints } from "../api/endpoints";
import { fetchContracts } from "../api/contracts";
import { fetchAlerts } from "../api/alerts";

function groupAlerts(alerts) {
  const map = {};

  alerts.forEach((a) => {
    const key = `${a.change_type}-${a.field}`;

    if (!map[key]) {
      map[key] = { ...a, count: 1 };
    } else {
      map[key].count++;
    }
  });

  return Object.values(map);
}

function EndpointsPage() {
  const [endpoints, setEndpoints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [impact, setImpact] = useState(null);

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  useEffect(() => {
    loadEndpoints();
  }, []);

  async function loadEndpoints() {
    try {
      const data = await fetchEndpoints();
      setEndpoints(data);
    } catch (err) {
      console.error("Failed to load endpoints:", err);
    }
  }

  async function handleSelect(endpoint, method) {
    setSelected({ endpoint, method });

    const contractsData = await fetchContracts(endpoint, method);
    setContracts(contractsData);

    const alertsData = await fetchAlerts(endpoint, method);

    setAlerts(alertsData.alerts || []);
    setImpact(alertsData.impact ?? null);
  }

  const filteredEndpoints = endpoints.filter((ep) => {
    const matchSearch = ep.endpoint
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchMethod =
      methodFilter === "ALL" || ep.method === methodFilter;

    return matchSearch && matchMethod;
  });

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === "ALL") return true;
    return a.severity === severityFilter;
  });

  return (
    <div>
      <h1>API Monitoring Dashboard</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          placeholder="Search endpoint..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="ALL">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="ALL">All Alerts</option>
          <option value="SAFE">Safe</option>
          <option value="RISKY">Risky</option>
          <option value="BREAKING">Breaking</option>
        </select>
      </div>

      {filteredEndpoints.map((ep, i) => (
        <div
          key={i}
          className="endpoint-item"
          onClick={() => handleSelect(ep.endpoint, ep.method)}
        >
          {ep.method} — {ep.endpoint}
        </div>
      ))}

      {selected && (
        <>
          <h2>
            Contracts — {selected.method} {selected.endpoint}
          </h2>

          {contracts.map((c) => (
            <div className="card" key={c.id}>
              <strong>Version {c.version}</strong>
              <pre className="code-block">
                {JSON.stringify(c.schema_json, null, 2)}
              </pre>
            </div>
          ))}

          <h2>Alerts</h2>

          {impact !== null && (
            <div className="impact">
              ⚠ ~{impact}% traffic affected
            </div>
          )}

          {groupAlerts(filteredAlerts).map((a) => (
            <div key={a.field} className="card">
              {a.change_type} — {a.field}

              <span className={`badge ${a.severity.toLowerCase()}`}>
                {a.severity}
              </span>

              {a.count > 1 && (
                <span style={{ marginLeft: 10 }}>×{a.count}</span>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default EndpointsPage;