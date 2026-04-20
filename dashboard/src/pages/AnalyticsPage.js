import { useEffect, useState } from "react";
import {
  fetchTraffic,
  fetchAlertTrend,
  fetchSeverity,
  fetchTopEndpoints,
  fetchInsights,
  fetchFieldUsage,
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
  CartesianGrid,
} from "recharts";

import { motion } from "framer-motion";

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
  const [fieldUsage, setFieldUsage] = useState([]);
  const [range, setRange] = useState("7d");
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
          fieldUsageData,
        ] = await Promise.all([
          fetchTraffic(range),
          fetchAlertTrend(range),
          fetchSeverity(range),
          fetchTopEndpoints(range),
          fetchInsights(),
          fetchFieldUsage(),
        ]);

        setTraffic(trafficData || []);
        setAlerts(alertTrendData || []);
        setSeverity(severityData || []);
        setTopEndpoints(topEndpointsData || []);
        setInsights(insightsData?.insights || []);
        setRecommendations(insightsData?.recommendations || []);
        setFieldUsage(fieldUsageData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [range]);

  if (loading) {
    return (
      <div className="grid-2">
        <div className="card skeleton" />
        <div className="card skeleton" />
      </div>
    );
  }

  const totalRequests = traffic.reduce((a, b) => a + (b.requests || 0), 0);
  const totalAlerts = alerts.reduce((a, b) => a + (b.alerts || 0), 0);

  return (
    <div>

      <div className="analytics-header">
        <h2>Analytics</h2>

        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="1h">1H</option>
          <option value="24h">24H</option>
          <option value="7d">7D</option>
        </select>
      </div>

      <div className="kpi-grid">
        <KPI title="Total Requests" value={totalRequests} />
        <KPI title="Total Alerts" value={totalAlerts} />
        <KPI title="Top Endpoint" value={topEndpoints[0]?.endpoint || "-"} />
      </div>

      <div className="card">
        <h3>AI Insights</h3>
        {insights.length === 0 ? (
          <p>No insights yet</p>
        ) : (
          insights.map((i, idx) => (
            <motion.div
              key={idx}
              className="insight"
              whileHover={{ scale: 1.02 }}
            >
              {i}
            </motion.div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Recommendations</h3>
        {recommendations.length === 0 ? (
          <p>No recommendations</p>
        ) : (
          recommendations.map((r, idx) => (
            <motion.div
              key={idx}
              className="recommendation"
              whileHover={{ x: 6 }}
            >
              {r}
            </motion.div>
          ))
        )}
      </div>

      <div className="grid-2">

        <div className="card">
          <h3>Traffic</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={traffic}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Alert Trends</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={alerts}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="alerts"
                stroke="#ef4444"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={severity} dataKey="value" innerRadius={50}>
                {severity.map((entry, index) => (
                  <Cell key={index} fill={COLORS[entry.name]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Top Endpoints</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topEndpoints}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="endpoint" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="requests" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card full">
          <h3>Field Usage</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fieldUsage}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="field" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <motion.div className="kpi-card" whileHover={{ scale: 1.05 }}>
      <p>{title}</p>
      <h2>{value}</h2>
    </motion.div>
  );
}

export default AnalyticsPage;