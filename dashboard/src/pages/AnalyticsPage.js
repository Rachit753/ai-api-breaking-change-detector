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
  const [recommendations, setRecommendations] = useState([]);

  const [range, setRange] = useState("24h");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

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

        setTraffic(trafficData || []);
        setAlerts(alertTrendData || []);
        setSeverity(severityData || []);
        setTopEndpoints(topEndpointsData || []);

        setInsights(insightsData?.insights || []);
        setRecommendations(insightsData?.recommendations || []);
      } catch (err) {
        console.error("Analytics load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [range]);

  if (loading) {
    return <p>Loading analytics...</p>;
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
            <div key={i} className="impact">
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
            <div key={i} className="impact">
              {rec}
            </div>
          ))
        )}
      </div>

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
              <Line dataKey="requests" stroke="#3b82f6" />
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
              <Line dataKey="alerts" stroke="#ef4444" />
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
              <Pie data={severity} dataKey="value" nameKey="name">
                {severity.map((entry, index) => (
                  <Cell key={index} fill={COLORS[entry.name]} />
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
              <YAxis />
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