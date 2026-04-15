import { useState } from "react";
import EndpointsPage from "./EndpointsPage";
import AnalyticsPage from "./AnalyticsPage";
import { removeToken } from "../utils/auth";
import DashboardStats from "../components/DashboardStats";

function Dashboard() {
  const [active, setActive] = useState("endpoints");

  function handleLogout() {
    removeToken();
    window.location.reload();
  }

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

        <DashboardStats totalEndpoints={1} totalAlerts={1} />

        {active === "endpoints" && <EndpointsPage />}
        {active === "analytics" && <AnalyticsPage />}
      </div>
    </div>
  );
}

export default Dashboard;