const crypto = require('crypto');

function createRequestId() {
  if (typeof crypto.randomUUID === 'function') {
    return `req_${crypto.randomUUID().replace(/-/g, '')}`;
  }

  return `req_${crypto.randomBytes(16).toString('hex')}`;
}

function normalizeRequestId(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return /^[A-Za-z0-9_-]{1,128}$/.test(trimmed) ? trimmed : null;
}

module.exports = function requestContext(req, res, next) {
  const incomingRequestId = req.headers && (req.headers['request-id'] || req.headers['x-request-id']);
  req.requestId = normalizeRequestId(incomingRequestId) || createRequestId();
  req.apiVersion = (req.headers && req.headers['api-version']) || '2026-06-11';

  if (typeof res.set === 'function') {
    res.set('Request-Id', req.requestId);
    res.set('API-Version', req.apiVersion);
  }

  next();
};

module.exports.normalizeRequestId = normalizeRequestId;
