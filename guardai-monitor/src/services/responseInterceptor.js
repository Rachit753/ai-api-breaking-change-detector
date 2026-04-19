function interceptResponse(res) {
  if (res._guardaiIntercepted) return;
  res._guardaiIntercepted = true;

  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function (body) {
    res.locals.responseBody = body;
    return originalSend.call(this, body);
  };

  res.json = function (body) {
    res.locals.responseBody = body;
    return originalJson.call(this, body);
  };
}

module.exports = { interceptResponse };