const pool = require("../config/db");


async function estimateImpact(endpoint, method) {
  const totalQuery = `
    SELECT COUNT(*) FROM request_logs
    WHERE endpoint = $1 AND method = $2
    AND created_at > NOW() - INTERVAL '1 hour'
  `;

  const result = await pool.query(totalQuery, [endpoint, method]);
  const total = parseInt(result.rows[0].count, 10);

  if (total === 0) return 0;

  
  const estimated = Math.round(total * 0.7);

  return Math.round((estimated / total) * 100);
}

module.exports = { estimateImpact };
