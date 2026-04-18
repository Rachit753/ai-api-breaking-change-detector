const supabase = require("../config/db");
const { interceptResponse } = require("../services/responseInterceptor");
const { schemaQueue } = require("../queue/queue");

const IGNORED_ROUTES = process.env.IGNORED_ROUTES
  ? process.env.IGNORED_ROUTES.split(",")
  : [
      "/api/auth",
      "/api/analytics",
      "/api/simulate",
      "/health",
    ];

function safeParse(data) {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return data;
  }
}

async function trafficCapture(req, res, next) {

  if (req.headers["x-internal-call"] === "true") {
    return next();
  }

  const shouldIgnore = IGNORED_ROUTES.some((route) =>
    req.originalUrl.startsWith(route)
  );

  if (shouldIgnore) {
    return next();
  }

  interceptResponse(res);

  const originalSend = res.send;

  res.send = async function (body) {
    try {
      const parsedBody = safeParse(body);
      const projectId = req.headers["x-project-id"];

      let actualEndpoint =
        req.headers["x-actual-endpoint"] ||
        req.originalUrl;

      actualEndpoint = actualEndpoint.replace(/^\/api/, "");

      const cleanedRequestBody =
        req.headers["x-actual-endpoint"] && req.body?.body
          ? req.body.body
          : req.body;

      const cleanedResponseBody =
        req.headers["x-actual-endpoint"] && parsedBody?.data
          ? parsedBody.data
          : parsedBody;

      const requestData = {
        endpoint: actualEndpoint,
        method: req.method,
        request_body: cleanedRequestBody || null,
        headers: req.headers || null,
        status_code: res.statusCode,
        response_body: cleanedResponseBody,
        user_id: req.user?.userId || null,
        project_id: projectId || null,
      };

      const { error: logError } = await supabase
        .from("request_logs")
        .insert([requestData]);

      if (logError) {
        console.error("Request log error:", logError.message);
      }

      await schemaQueue.add(
        "process-schema",
        {
          endpoint: actualEndpoint,
          method: req.method,
          requestBody: cleanedRequestBody,
          responseBody: cleanedResponseBody,
          userId: req.user?.userId,
          projectId: projectId,
        },
        {
          jobId: `${actualEndpoint}-${req.method}-${Date.now()}`,
        }
      );
    } catch (err) {
      console.error("Traffic capture error:", err.message);
    }

    return originalSend.call(this, body);
  };

  next();
}

module.exports = trafficCapture;