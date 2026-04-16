const supabase = require("../config/db");
const { interceptResponse } = require("../services/responseInterceptor");
const { schemaQueue } = require("../queue/queue");

const IGNORED_ROUTES = process.env.IGNORED_ROUTES
  ? process.env.IGNORED_ROUTES.split(",")
  : ["/api/auth", "/api/analytics", "/health"];

function safeParse(data) {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return data;
  }
}

async function trafficCapture(req, res, next) {
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

      const requestData = {
        endpoint: req.originalUrl,
        method: req.method,
        request_body: req.body || null,
        headers: req.headers || null,
        status_code: res.statusCode,
        response_body: parsedBody,
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
          endpoint: req.originalUrl,
          method: req.method,
          requestBody: req.body,
          responseBody: parsedBody,
          userId: req.user?.userId,
          projectId: projectId,
        },
        {
          jobId: `${req.originalUrl}-${req.method}-${Date.now()}`,
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