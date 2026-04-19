const { initDB } = require("./config/db");
const { initQueue } = require("./queue/queue");
const createTrafficCapture = require("./trafficCapture");

function guardaiMonitor(config = {}) {
  const {
    supabaseUrl,
    supabaseKey,
    projectId,
    redisUrl,
    ignoreRoutes,
    enable = true,
  } = config;

  if (!enable) {
    return (req, res, next) => next();
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("GuardAI: Missing Supabase config");
  }

  initDB({ supabaseUrl, supabaseKey });

  const { schemaQueue } = initQueue(redisUrl);

  const middleware = createTrafficCapture({
    schemaQueue,
    options: { ignoreRoutes },
  });

  return function (req, res, next) {
    req.guardai = { projectId };
    return middleware(req, res, next);
  };
}

module.exports = guardaiMonitor;