const pool = require("../config/db");

async function createAlert({ endpoint, method, change_type, field, severity }) {
  const query = `
    INSERT INTO alerts (endpoint, method, change_type, field, severity)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [endpoint, method, change_type, field, severity];

  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = { createAlert };
