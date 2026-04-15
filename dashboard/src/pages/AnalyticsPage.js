import { useEffect, useState } from "react";
import {
  fetchTraffic,
  fetchAlertTrend,
  fetchSeverity,
  fetchTopEndpoints,
} from "../api/analytics";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const COLORS = {
  BREAKING: "#ef4444",
  RISKY: "#f59e0b",
  SAFE: "#10b981",
};

function AnalyticsPage() {
  const [traffic, setTraffic] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [severity, setSeverity] = useState([]);
  const [topEndpoints, setTopEndpoints] = useState([]);
  const [range, setRange] = useState("24h");

  useEffect(() => {
    async function load() {
      try {
        setTraffic(await fetchTraffic(range));
        setAlerts(await fetchAlertTrend(range));
        setSeverity(await fetchSeverity(range));
        setTopEndpoints(await fetchTopEndpoints(range));
      } catch (err) {
        console.error("Analytics load error:", err);
      }
    }
    load();
  }, [range]);

  return (
    <div>
      <h2>Analytics Dashboard</h2>

      <select value={range} onChange={(e) => setRange(e.target.value)}>
        <option value="1h">Last 1 Hour</option>
        <option value="24h">Last 24 Hours</option>
        <option value="7d">Last 7 Days</option>
      </select>

      <div className="card">
        <h3>Traffic</h3>
        {traffic.length === 0 ? (
          <p>No traffic data</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={traffic}>
              <XAxis dataKey="time" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="requests" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Alert Trends</h3>
        {alerts.length === 0 ? (
          <p>No alert data</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={alerts}>
              <XAxis dataKey="time" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="alerts" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Severity Distribution</h3>
        {severity.every((s) => s.value === 0) ? (
          <p>No alerts</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severity}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {severity.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[entry.name] || "#8884d8"}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Top Endpoints</h3>
        {topEndpoints.length === 0 ? (
          <p>No endpoint data</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topEndpoints}>
              <XAxis dataKey="endpoint" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="requests" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;