const pool = require("../config/db");
//const { get } = require("../routes/endpointRoutes");

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
