import { useState } from "react";
import EndpointsPage from "./EndpointsPage";
import { removeToken } from "../utils/auth";

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

        <div className="nav-item" onClick={() => setActive("endpoints")}>
          Endpoints
        </div>

        <div className="nav-item">Analytics (soon)</div>
        <div className="nav-item">Settings (soon)</div>

        <div
          className="nav-item"
          style={{ marginTop: 20, color: "#ef4444" }}
          onClick={handleLogout}
        >
          Logout
        </div>
      </div>

      <div className="main">
        {active === "endpoints" && <EndpointsPage />}
      </div>
    </div>
  );
}

export default Dashboard;