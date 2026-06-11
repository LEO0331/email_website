describe('surveyRoutes', () => {
  const originalEnv = { ...process.env };

  function setupRoutes(options = {}) {
    const routes = { get: {}, post: {} };
    const app = {
      post: jest.fn((route, handler) => {
        routes.post[route] = handler;
      }),
      get: jest.fn((route, handler) => {
        routes.get[route] = handler;
      }),
    };

    const sendMock = options.sendMock || jest.fn().mockResolvedValue({ id: 'msg_1' });
    const MailerMock = jest.fn(() => ({ send: sendMock }));
    const templateMock = jest.fn(() => '<html>template</html>');
    const listSurveysMock = options.listSurveysMock || jest.fn(() => []);
    const createSurveyMock =
      options.createSurveyMock ||
      jest.fn(input => ({
        _id: 'survey-1',
        ...input,
        yes: 0,
        no: 0,
        dateSent: '2026-01-01T00:00:00.000Z',
      }));

    jest.isolateModules(() => {
      jest.doMock('../services/Mailer', () => MailerMock);
      jest.doMock('../services/surveyTemplate', () => templateMock);
      jest.doMock('../services/demoStore', () => ({
        listSurveys: listSurveysMock,
        createSurvey: createSurveyMock,
      }));
      require('../routes/surveyRoutes')(app);
    });

    return {
      routes,
      sendMock,
      MailerMock,
      templateMock,
      listSurveysMock,
      createSurveyMock,
    };
  }

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.EMAIL_RATE_LIMIT_MAX = '5';
    process.env.EMAIL_RATE_LIMIT_WINDOW_MS = '60000';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('GET /api/surveys returns list from store', () => {
    const surveys = [{ _id: 's1', title: 'Survey A' }];
    const { routes, listSurveysMock } = setupRoutes({
      listSurveysMock: jest.fn(() => surveys),
    });

    const res = { send: jest.fn() };
    routes.get['/api/surveys']({}, res);

    expect(listSurveysMock).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      object: 'list',
      data: surveys,
      has_more: false,
      url: '/api/surveys',
    });
  });

  test('GET /api/surveys supports limit and starting_after pagination', () => {
    const surveys = [
      { _id: 's1', title: 'Oldest', dateSent: '2026-01-01T00:00:00.000Z' },
      { _id: 's2', title: 'Middle', dateSent: '2026-01-02T00:00:00.000Z' },
      { _id: 's3', title: 'Newest', dateSent: '2026-01-03T00:00:00.000Z' },
    ];
    const { routes } = setupRoutes({
      listSurveysMock: jest.fn(() => surveys),
    });

    const res = { send: jest.fn() };
    routes.get['/api/surveys'](
      {
        query: {
          limit: '1',
          starting_after: 's3',
        },
      },
      res
    );

    expect(res.send).toHaveBeenCalledWith({
      object: 'list',
      data: [surveys[1]],
      has_more: true,
      url: '/api/surveys',
    });
  });

  test('POST /api/surveys returns 400 for missing required fields', async () => {
    const { routes } = setupRoutes();
    const req = {
      body: {
        title: '',
        subject: 'S',
        body: 'B',
        recipients: ['a@example.com'],
      },
      headers: {},
      ip: '127.0.0.1',
    };
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await routes.post['/api/surveys'](req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: expect.objectContaining({
        type: 'validation_error',
        code: 'missing_required_param',
        message: 'Title, subject, and body are required',
        param: 'title',
      }),
    });
  });

  test('POST /api/surveys creates survey and sends response', async () => {
    const sendMock = jest.fn().mockResolvedValue({ id: 'msg_1' });
    const { routes, createSurveyMock, templateMock, MailerMock } = setupRoutes({ sendMock });

    const req = {
      body: {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
        recipients: 'a@example.com, b@example.com',
      },
      headers: {},
      ip: '127.0.0.1',
    };
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await routes.post['/api/surveys'](req, res);

    expect(createSurveyMock).toHaveBeenCalledWith({
      title: 'Roadmap Pulse',
      subject: 'Q2 Priority',
      body: 'Should we build feature X?',
      recipients: ['a@example.com', 'b@example.com'],
    });
    expect(MailerMock).toHaveBeenCalled();
    expect(templateMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ _id: 'survey-1' }));
  });

  test('POST /api/surveys replays matching idempotent request without sending twice', async () => {
    const sendMock = jest.fn().mockResolvedValue({ id: 'msg_1' });
    const { routes } = setupRoutes({ sendMock });

    const req = {
      method: 'POST',
      path: '/api/surveys',
      body: {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
        recipients: 'a@example.com',
      },
      headers: { 'idempotency-key': 'idem_123' },
      ip: '127.0.0.1',
    };
    const firstRes = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    const secondRes = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await routes.post['/api/surveys'](req, firstRes);
    await routes.post['/api/surveys'](req, secondRes);

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(secondRes.status).toHaveBeenCalledWith(201);
    expect(secondRes.send).toHaveBeenCalledWith(firstRes.send.mock.calls[0][0]);
  });

  test('POST /api/surveys rejects idempotency key reuse with different params', async () => {
    const { routes } = setupRoutes();
    const baseReq = {
      method: 'POST',
      path: '/api/surveys',
      body: {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
        recipients: 'a@example.com',
      },
      headers: { 'idempotency-key': 'idem_conflict' },
      ip: '127.0.0.1',
    };
    const changedReq = {
      ...baseReq,
      body: {
        ...baseReq.body,
        title: 'Different title',
      },
    };
    const firstRes = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    const secondRes = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await routes.post['/api/surveys'](baseReq, firstRes);
    await routes.post['/api/surveys'](changedReq, secondRes);

    expect(secondRes.status).toHaveBeenCalledWith(409);
    expect(secondRes.send).toHaveBeenCalledWith({
      error: expect.objectContaining({
        type: 'idempotency_error',
        code: 'idempotency_key_reused_with_different_params',
      }),
    });
  });

  test('POST /api/surveys/send-email returns success when send resolves', async () => {
    const { routes, sendMock, MailerMock, templateMock } = setupRoutes();

    const req = {
      body: {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
        recipients: ['a@example.com'],
      },
      headers: {},
      ip: '127.0.0.1',
    };
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await routes.post['/api/surveys/send-email'](req, res);

    expect(templateMock).toHaveBeenCalledWith({
      title: 'Roadmap Pulse',
      subject: 'Q2 Priority',
      body: 'Should we build feature X?',
      recipients: ['a@example.com'],
    });
    expect(MailerMock).toHaveBeenCalledWith(
      {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
        recipients: ['a@example.com'],
      },
      '<html>template</html>'
    );
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      object: 'email_delivery',
      success: true,
      message: 'Email sent successfully',
      idempotency_key: null,
    });
  });

  test('returns 500 when email send throws', async () => {
    const sendMock = jest.fn().mockRejectedValue(new Error('resend down'));
    const { routes } = setupRoutes({ sendMock });

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const req = {
      body: {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
        recipients: ['a@example.com'],
      },
      headers: {},
      ip: '127.0.0.1',
    };
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await routes.post['/api/surveys/send-email'](req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: expect.objectContaining({
        type: 'api_error',
        code: 'email_send_failed',
        message: 'Failed to send email',
      }),
    });

    errorSpy.mockRestore();
  });

  test('returns 400 when recipients are not an array', async () => {
    const { routes } = setupRoutes();
    const req = {
      body: {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
        recipients: 'a@example.com,b@example.com',
      },
      headers: {},
      ip: '127.0.0.1',
    };
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await routes.post['/api/surveys/send-email'](req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: expect.objectContaining({
        type: 'validation_error',
        code: 'invalid_param_type',
        message: 'Recipients must be an array of email addresses',
        param: 'recipients',
      }),
    });
  });

  test('returns 400 when recipient email format is invalid', async () => {
    const { routes } = setupRoutes();
    const req = {
      body: {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
        recipients: ['ok@example.com', 'not-an-email'],
      },
      headers: {},
      ip: '127.0.0.1',
    };
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await routes.post['/api/surveys/send-email'](req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: expect.objectContaining({
        type: 'validation_error',
        code: 'invalid_email',
        message: 'Invalid recipient emails: not-an-email',
        param: 'recipients',
      }),
    });
  });

  test('returns 429 when request limit is exceeded', async () => {
    process.env.EMAIL_RATE_LIMIT_MAX = '1';
    process.env.EMAIL_RATE_LIMIT_WINDOW_MS = '60000';
    const { routes } = setupRoutes();

    const req = {
      body: {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
        recipients: ['ok@example.com'],
      },
      headers: { 'x-forwarded-for': '8.8.8.8' },
      ip: '127.0.0.1',
    };
    const res1 = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    const res2 = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await routes.post['/api/surveys/send-email'](req, res1);
    await routes.post['/api/surveys/send-email'](req, res2);

    expect(res2.status).toHaveBeenCalledWith(429);
    expect(res2.send).toHaveBeenCalledWith({
      error: expect.objectContaining({
        type: 'rate_limit_error',
        code: 'rate_limit_exceeded',
        message: 'Too many requests. Please wait and try again.',
      }),
    });
  });
});
