const pool = require("../config/db");
const { extractSchema } = require("../services/schemaExtractor");
const { saveContract, getLatestContract } = require("../models/contractModel");
const { compareSchemas } = require("../services/changeDetection");
const { storeAlerts } = require("../services/alertService");

async function trafficCapture(req, res, next) {
  const originalSend = res.send;

  res.send = async function (body) {
    try {
      // Log every request for impact analysis
      await pool.query(
        "INSERT INTO request_logs (endpoint, method) VALUES ($1, $2)",
        [req.originalUrl, req.method]
      );

      // Only process if request body exists
      if (req.body && Object.keys(req.body).length > 0) {
        const newSchema = extractSchema(req.body);

        const latest = await getLatestContract(req.originalUrl, req.method);

        // First version
        if (!latest) {
          await saveContract({
            endpoint: req.originalUrl,
            method: req.method,
            schema: newSchema,
          });
        } else {
          const changes = compareSchemas(latest.schema_json, newSchema);

          if (changes.length > 0) {
            // Save new contract version
            await saveContract({
              endpoint: req.originalUrl,
              method: req.method,
              schema: newSchema,
            });

            // Store alerts in DB
            await storeAlerts(req.originalUrl, req.method, changes);

            console.log("🚨 Alerts stored for schema change:", changes);
          }
        }
      }
    } catch (err) {
      console.error("Traffic capture error:", err.message);
    }

    return originalSend.call(this, body);
  };

  next();
}

module.exports = trafficCapture;
