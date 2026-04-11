const supabase = require("../config/db");
const { extractSchema } = require("../services/schemaExtractor");
const { saveContract, getLatestContract } = require("../models/contractModel");
const { compareSchemas } = require("../services/changeDetection");
const { storeAlerts } = require("../services/alertService");
const { interceptResponse } = require("../services/responseInterceptor");

async function trafficCapture(req, res, next) {
  if (!req.originalUrl.startsWith("/test")) {
    return next();
  }
  interceptResponse(res);

  const originalSend = res.send;

  res.send = async function (body) {
    try {
      const requestData = {
        endpoint: req.originalUrl,
        method: req.method,
        request_body: req.body || null,
        headers: req.headers || null,
        status_code: res.statusCode,
        response_body: body || null,
      };

      const { error: logError } = await supabase
        .from("request_logs")
        .insert([requestData]);

      if (logError) {
        console.error("Request log error:", logError.message);
      }

      const requestSchema = extractSchema(req.body || {});
      const responseSchema = extractSchema(body || {});

      const combinedSchema = {
        request: requestSchema,
        response: responseSchema,
      };

      const latest = await getLatestContract(req.originalUrl, req.method);

      if (!latest) {
        await saveContract({
          endpoint: req.originalUrl,
          method: req.method,
          schema: combinedSchema,
        });
      } else {
        const changes = compareSchemas(latest.schema_json, combinedSchema);

        if (changes.length > 0) {
          await saveContract({
            endpoint: req.originalUrl,
            method: req.method,
            schema: combinedSchema,
          });

          await storeAlerts(req.originalUrl, req.method, changes);

          console.log("Schema changes detected:", changes);
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