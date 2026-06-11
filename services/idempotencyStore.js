const crypto = require('crypto');

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const records = new Map();

function getIdempotencyKey(req) {
  return req.headers && (req.headers['idempotency-key'] || req.headers['Idempotency-Key']);
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function hashRequest(req) {
  const payload = {
    method: req.method,
    path: req.path || req.originalUrl || req.url,
    body: req.body || {},
  };

  return crypto.createHash('sha256').update(stableStringify(payload)).digest('hex');
}

function readIdempotencyRecord(req) {
  const key = getIdempotencyKey(req);
  if (!key) {
    return null;
  }

  const record = records.get(key);
  if (!record) {
    return null;
  }

  if (record.expiresAt <= Date.now()) {
    records.delete(key);
    return null;
  }

  return record;
}

function saveIdempotencyRecord(req, statusCode, body, ttlMs = DEFAULT_TTL_MS) {
  const key = getIdempotencyKey(req);
  if (!key) {
    return;
  }

  records.set(key, {
    requestHash: hashRequest(req),
    statusCode,
    body,
    expiresAt: Date.now() + ttlMs,
  });
}

function clearIdempotencyStore() {
  records.clear();
}

module.exports = {
  getIdempotencyKey,
  hashRequest,
  readIdempotencyRecord,
  saveIdempotencyRecord,
  clearIdempotencyStore,
};
