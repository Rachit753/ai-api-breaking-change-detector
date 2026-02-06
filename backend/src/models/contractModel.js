const pool = require("../config/db");
//const { get } = require("../routes/endpointRoutes");

async function saveContract({ endpoint, method, schema }) {
  // Get latest version
  const latestQuery = `
    SELECT version
    FROM contracts
    WHERE endpoint = $1 AND method = $2
    ORDER BY version DESC
    LIMIT 1;
  `;

  const latestResult = await pool.query(latestQuery, [endpoint, method]);

  let newVersion = 1;

  if (latestResult.rows.length > 0) {
    newVersion = latestResult.rows[0].version + 1;
  }
console.log("🔥 NEW saveContract logic running");

  // Insert new contract with incremented version
  const insertQuery = `
    INSERT INTO contracts (endpoint, method, schema_json, version)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [endpoint, method, schema, newVersion];

  const result = await pool.query(insertQuery, values);
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

async function getAllEndpoints() {
  const query = `
    SELECT DISTINCT endpoint, method
    FROM contracts
    ORDER BY endpoint;
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function getContractsByEndpoint(endpoint, method) {
  const query = `
    SELECT *
    FROM contracts
    WHERE endpoint = $1 AND method = $2
    ORDER BY version DESC;
  `;

  const result = await pool.query(query, [endpoint, method]);
  return result.rows;
}



module.exports = { 
  saveContract,
  getLatestContract, 
  getAllEndpoints,
  getContractsByEndpoint,
};
