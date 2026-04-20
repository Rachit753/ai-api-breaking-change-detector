import { useEffect, useState } from "react";
import { fetchEndpoints } from "../api/endpoints";
import { fetchAlerts } from "../api/alerts";
import EndpointsPage from "./EndpointsPage";
import AnalyticsPage from "./AnalyticsPage";
import LogsPage from "./LogsPage";
import SimulatorPage from "./SimulatorPage";
import AnimatedPage from "../components/AnimatedPage";
import { removeToken } from "../utils/auth";
import DashboardStats from "../components/DashboardStats";
import ProjectSelector from "../components/ProjectSelector";

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

        const alertPromises = endpoints.map((ep) =>
          fetchAlerts(ep.endpoint, ep.method)
        );

        const alertResults = await Promise.all(alertPromises);

        const alertCount = alertResults.reduce(
          (sum, res) => sum + (res.alerts?.length || 0),
          0
        );

        setTotalAlerts(alertCount);
      } catch (err) {
        console.error(err);
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
          className={`nav-item ${active === "endpoints" ? "active" : ""}`}
          onClick={() => setActive("endpoints")}
        >
          Endpoints
        </div>

        <div
          className={`nav-item ${active === "analytics" ? "active" : ""}`}
          onClick={() => setActive("analytics")}
        >
          Analytics
        </div>

        <div
          className={`nav-item ${active === "logs" ? "active" : ""}`}
          onClick={() => setActive("logs")}
        >
          Logs
        </div>

        <div
          className={`nav-item ${active === "simulator" ? "active" : ""}`}
          onClick={() => setActive("simulator")}
        >
          Simulator
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
        <ProjectSelector />

        {loading ? (
          <div>
            <div className="skeleton" style={{ width: 200, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: 150 }} />
          </div>
        ) : (
          <DashboardStats
            totalEndpoints={totalEndpoints}
            totalAlerts={totalAlerts}
          />
        )}

        {active === "endpoints" && (
          <AnimatedPage>
            <EndpointsPage />
          </AnimatedPage>
        )}

        {active === "analytics" && (
          <AnimatedPage>
            <AnalyticsPage />
          </AnimatedPage>
        )}

        {active === "logs" && (
          <AnimatedPage>
            <LogsPage />
          </AnimatedPage>
        )}

        {active === "simulator" && (
          <AnimatedPage>
            <SimulatorPage />
          </AnimatedPage>
        )}
      </div>
    </div>
  );
}

export default Dashboard;