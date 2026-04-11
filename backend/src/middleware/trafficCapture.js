const supabase = require("../config/db");
const { extractSchema } = require("../services/schemaExtractor");
const { saveContract, getLatestContract } = require("../models/contractModel");
const { compareSchemas } = require("../services/changeDetection");
const { storeAlerts } = require("../services/alertService");
const { interceptResponse } = require("../services/responseInterceptor");
const { mergeSchemas } = require("../services/schemaMerger");

function cleanSchema(schema) {
  if (!schema || typeof schema !== "object") return schema;

  const cleaned = {};

  for (const key in schema) {
    const val = schema[key];

    if (typeof val === "object") {
      cleaned[key] = cleanSchema(val);

      if (val.type) cleaned[key].type = val.type;
      if (val.required !== undefined) cleaned[key].required = val.required;
    }
  }

  return cleaned;
}

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

      const rawSchema = {
        request: requestSchema,
        response: responseSchema,
      };
      
      const latest = await getLatestContract(req.originalUrl, req.method);

      if (!latest) {
        const cleaned = cleanSchema(rawSchema);

        await saveContract({
          endpoint: req.originalUrl,
          method: req.method,
          schema: cleaned,
        });
      } else {
        const changes = compareSchemas(latest.schema_json, rawSchema);

        let mergedSchema = mergeSchemas(latest.schema_json, rawSchema);
        mergedSchema = cleanSchema(mergedSchema);

        if (changes.length > 0) {
          await saveContract({
          endpoint: req.originalUrl,
          method: req.method,
            schema: mergedSchema,
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