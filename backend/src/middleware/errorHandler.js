function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON format in request body",
    });
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
}

module.exports = errorHandler;
