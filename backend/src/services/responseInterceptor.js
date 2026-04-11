function interceptResponse(res) {
  const originalSend = res.send;

  res.send = function (body) {
    res.locals.responseBody = body;

    return originalSend.call(this, body);
  };
}

module.exports = { interceptResponse };