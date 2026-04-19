const { logError } = require("../services/errorLogger");

function errorHandler(err, req, res, next) {
  console.error("ERROR:", err.message);

  logError({
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
    userId: req.user?.userId,
    projectId: req.headers["x-project-id"],
  });

  res.status(500).json({
    error: "Internal Server Error",
  });
}

module.exports = errorHandler;