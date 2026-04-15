import { useEffect, useState } from "react";
import { fetchTraffic } from "../api/analytics";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function AnalyticsPage() {
  const [data, setData] = useState([]);
  const [range, setRange] = useState("24h");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchTraffic(range);
        setData(res);
      } catch (err) {
        console.error("Analytics error:", err);
      }
    }

    loadData();
  }, [range]);

  return (
    <div className="card">
      <h2>API Traffic</h2>

      <div style={{ marginBottom: 15 }}>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="1h">Last 1 Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="requests" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AnalyticsPage;