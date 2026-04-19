const { getDB } = require("./config/db");
const { interceptResponse } = require("./services/responseInterceptor");
const crypto = require("crypto");

function createTrafficCapture({ schemaQueue, options }) {
  const IGNORED_ROUTES = options?.ignoreRoutes || [
    "/api/auth",
    "/health",
  ];

  function safeParse(data) {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return data;
    }
  }

  function isValidPayload(obj) {
    return obj && typeof obj === "object";
  }

  return async function trafficCapture(req, res, next) {
    try {
      if (req.headers["x-internal-call"] === "true") return next();
      if (IGNORED_ROUTES.some((r) => req.originalUrl.startsWith(r))) return next();

      interceptResponse(res);

      res.on("finish", async () => {
        try {
          const supabase = getDB();

          const parsedBody = safeParse(res.locals.responseBody);
          const projectId = req.guardai?.projectId || null;

          const endpoint = req.originalUrl.replace(/^\/api/, "");
          const userId =
            req.user?.userId || req.headers["x-user-id"] || null;

          if (!isValidPayload(req.body) || !isValidPayload(parsedBody)) {
            console.warn("Invalid payload skipped");
            return;
          }

          const requestData = {
            endpoint,
            method: req.method,
            request_body: req.body,
            response_body: parsedBody,
            headers: req.headers || null,
            status_code: res.statusCode,
            user_id: userId,
            project_id: projectId,
          };

          await supabase.from("request_logs").insert([requestData]);

          if (!schemaQueue) {
            console.warn("Queue disabled → processing inline");

            const processor = require("./worker/workerProcessor");
            await processor({
              data: {
                endpoint,
                method: req.method,
                requestBody: req.body,
                responseBody: parsedBody,
                userId,
                projectId,
              },
            });

            return;
          }

          const hash = crypto
            .createHash("md5")
            .update(JSON.stringify(req.body || {}))
            .digest("hex");

          await schemaQueue.add(
            "process-schema",
            {
              endpoint,
              method: req.method,
              requestBody: req.body,
              responseBody: parsedBody,
              userId,
              projectId,
            },
            {
              jobId: `${endpoint}-${req.method}-${hash}`,
            }
          );
        } catch (err) {
          console.error("GuardAI error:", err.message);
        }
      });

      next();
    } catch (err) {
      console.error("Middleware crash prevented:", err.message);
      next();
    }
  };
}

module.exports = createTrafficCapture;