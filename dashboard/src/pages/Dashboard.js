import { useEffect, useState } from "react";
import { fetchEndpoints } from "../api/endpoints";
import { fetchAlerts } from "../api/alerts";
import EndpointsPage from "./EndpointsPage";
import AnalyticsPage from "./AnalyticsPage";
import { removeToken } from "../utils/auth";
import DashboardStats from "../components/DashboardStats";

function Dashboard() {
  const [active, setActive] = useState("endpoints");

  const [totalEndpoints, setTotalEndpoints] = useState(0);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [loading, setLoading] = useState(true);

  function handleLogout() {
    removeToken();
    window.location.reload();
  }

  useEffect(() => {
    async function loadStats() {
      try {
        const endpoints = await fetchEndpoints();
        setTotalEndpoints(endpoints.length);

        let alertCount = 0;

        for (const ep of endpoints) {
          const data = await fetchAlerts(ep.endpoint, ep.method);
          alertCount += data.alerts?.length || 0;
        }

        setTotalAlerts(alertCount);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="app">
      <div className="sidebar">
        <h2>GuardAI</h2>

        <div
          className="nav-item"
          onClick={() => setActive("endpoints")}
        >
          Endpoints
        </div>

        <div
          className="nav-item"
          onClick={() => setActive("analytics")}
        >
          Analytics
        </div>

        <div
          className="nav-item"
          style={{ marginTop: 20, color: "#ef4444" }}
          onClick={handleLogout}
        >
          Logout
        </div>
      </div>

      <div className="main">
        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <DashboardStats
            totalEndpoints={totalEndpoints}
            totalAlerts={totalAlerts}
          />
        )}

        {active === "endpoints" && <EndpointsPage />}
        {active === "analytics" && <AnalyticsPage />}
      </div>
    </div>
  );
}

export default Dashboard;