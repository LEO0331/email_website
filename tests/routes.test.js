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
    expect(res.send).toHaveBeenCalledWith(surveys);
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
      error: 'Title, subject, and body are required',
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
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ _id: 'survey-1' }));
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
      success: true,
      message: 'Email sent successfully',
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
      error: 'Failed to send email',
      message: 'resend down',
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
      error: 'Recipients must be an array of email addresses',
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
      error: 'Invalid recipient emails: not-an-email',
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
      error: 'Too many requests. Please wait and try again.',
    });
  });
});
