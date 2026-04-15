import "./DashboardStats.css";

export default function DashboardStats({ totalEndpoints, totalAlerts }) {
  return (
    <div className="stats-container">
      <div className="stat-card">
        <h3>{totalEndpoints}</h3>
        <p>Endpoints</p>
      </div>

      <div className="stat-card">
        <h3>{totalAlerts}</h3>
        <p>Alerts</p>
      </div>
    </div>
  );
}