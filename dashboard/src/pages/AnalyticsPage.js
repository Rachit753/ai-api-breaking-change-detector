import { useEffect, useState } from "react";
import {
  fetchTraffic,
  fetchAlertTrend,
  fetchSeverity,
  fetchTopEndpoints,
  fetchInsights,
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
  const [insights, setInsights] = useState([]);
  const [range, setRange] = useState("24h");

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          trafficData,
          alertTrendData,
          severityData,
          topEndpointsData,
          insightsData,
        ] = await Promise.all([
          fetchTraffic(range),
          fetchAlertTrend(range),
          fetchSeverity(range),
          fetchTopEndpoints(range),
          fetchInsights(),
        ]);

        setTraffic(trafficData);
        setAlerts(alertTrendData);
        setSeverity(severityData);
        setTopEndpoints(topEndpointsData);
        setInsights(insightsData);

        generateRecommendations(severityData, topEndpointsData);
      } catch (err) {
        console.error("Analytics load error:", err);
      }
    }

    loadData();
  }, [range]);

  function generateRecommendations(severityData, endpointsData) {
    const recs = [];

    const breaking =
      severityData.find((s) => s.name === "BREAKING")?.value || 0;

    const risky =
      severityData.find((s) => s.name === "RISKY")?.value || 0;

    if (breaking > 2) {
      recs.push("Avoid removing required fields — this breaks existing clients");
      recs.push("Use API versioning before introducing breaking changes");
    }

    if (risky > 3) {
      recs.push("Review risky changes — may cause partial client failures");
    }

    if (endpointsData.length > 0) {
      recs.push(
        `Stabilize high-traffic endpoint: ${endpointsData[0].endpoint}`
      );
    }

    if (recs.length === 0) {
      recs.push("Your API is stable — no major risks detected");
    }

    setRecommendations(recs);
  }

  return (
    <div>
      <h2>Analytics Dashboard</h2>

      <div style={{ marginBottom: 15 }}>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="1h">Last 1 Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      <div className="card">
        <h3>AI Insights</h3>

        {insights.length === 0 ? (
          <p>No insights yet</p>
        ) : (
          insights.map((insight, i) => (
            <div
              key={i}
              style={{
                marginBottom: 10,
                padding: "10px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              {insight}
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Recommendations</h3>

        {recommendations.length === 0 ? (
          <p>No recommendations</p>
        ) : (
          recommendations.map((rec, i) => (
            <div
              key={i}
              style={{
                marginBottom: 8,
                padding: "8px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              {rec}
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Traffic</h3>
        {traffic.length === 0 ? (
          <p>No traffic data available for selected range</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={traffic}>
              <XAxis
                dataKey="time"
                tickFormatter={(t) =>
                  new Date(t).toLocaleTimeString()
                }
              />
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
          <p>No traffic data available for selected range</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={alerts}>
              <XAxis
                dataKey="time"
                tickFormatter={(t) =>
                  new Date(t).toLocaleTimeString()
                }
              />
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
          <p>No traffic data available for selected range</p>
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
          <p>No traffic data available for selected range</p>
        ) : topEndpoints.length === 1 ? (
          <div style={{ padding: "10px" }}>
            <strong>{topEndpoints[0].endpoint}</strong>
            <p>{topEndpoints[0].requests} requests</p>
          </div>
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