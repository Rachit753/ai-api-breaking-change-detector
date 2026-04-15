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

  useEffect(() => {
    async function load() {
      const res = await fetchTraffic();
      setData(res);
    }
    load();
  }, []);

  return (
    <div className="card">
      <h2>API Traffic</h2>

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