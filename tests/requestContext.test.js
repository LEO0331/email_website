const requestContext = require('../middlewares/requestContext');

describe('requestContext middleware', () => {
  test('uses a valid incoming request id', () => {
    const req = {
      headers: {
        'request-id': 'req_client_123',
      },
    };
    const res = {
      set: jest.fn(),
    };
    const next = jest.fn();

    requestContext(req, res, next);

    expect(req.requestId).toBe('req_client_123');
    expect(res.set).toHaveBeenCalledWith('Request-Id', 'req_client_123');
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('generates a request id when the incoming value is malformed', () => {
    const req = {
      headers: {
        'x-request-id': 'bad\r\nInjected: value',
      },
    };
    const res = {
      set: jest.fn(),
    };
    const next = jest.fn();

    requestContext(req, res, next);

    expect(req.requestId).toMatch(/^req_[a-f0-9]+$/);
    expect(req.requestId).not.toContain('Injected');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
