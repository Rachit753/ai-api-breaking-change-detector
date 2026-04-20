import "./DashboardStats.css";
import { motion } from "framer-motion";

export default function DashboardStats({ totalEndpoints, totalAlerts }) {
  return (
    <div className="stats-container">
      <motion.div
        className="stat-card"
        whileHover={{ scale: 1.05 }}
      >
        <h3>{totalEndpoints}</h3>
        <p>Endpoints</p>
      </motion.div>

      <motion.div
        className="stat-card"
        whileHover={{ scale: 1.05 }}
      >
        <h3>{totalAlerts}</h3>
        <p>Alerts</p>
      </motion.div>
    </div>
  );
}