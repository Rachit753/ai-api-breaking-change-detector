const supabase = require("../config/db");
const { interceptResponse } = require("../services/responseInterceptor");
const { schemaQueue } = require("../queue/queue");

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

      await schemaQueue.add("process-schema", {
        endpoint: req.originalUrl,
        method: req.method,
        requestBody: req.body,
        responseBody: body,
      });

    } catch (err) {
      console.error("Traffic capture error:", err.message);
    }

    return originalSend.call(this, body);
  };

  next();
}

module.exports = trafficCapture;