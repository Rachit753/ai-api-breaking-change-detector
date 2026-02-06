const pool = require("../config/db");

async function saveContract({ endpoint, method, schema }) {
  const query = `
    INSERT INTO contracts (endpoint, method, schema_json)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [endpoint, method, schema];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getLatestContract(endpoint, method) {
  const query = `
    SELECT * FROM contracts
    WHERE endpoint = $1 AND method = $2
    ORDER BY version DESC
    LIMIT 1;
  `;

  const result = await pool.query(query, [endpoint, method]);
  return result.rows[0];
}


module.exports = { saveContract, getLatestContract };
