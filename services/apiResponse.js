function getRequestId(req) {
  return req.requestId || 'req_unknown';
}

function sendError(res, req, status, { type, code, message, param }) {
  return res.status(status).send({
    error: {
      type,
      code,
      message,
      ...(param ? { param } : {}),
      request_id: getRequestId(req),
    },
  });
}

function sendList(res, { data, hasMore, url }) {
  return res.send({
    object: 'list',
    data,
    has_more: hasMore,
    url,
  });
}

module.exports = {
  sendError,
  sendList,
};
