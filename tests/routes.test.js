describe('surveyRoutes', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('returns success when email send resolves', async () => {
    const routes = {};
    const app = {
      post: jest.fn((route, handler) => {
        routes[route] = handler;
      }),
      get: jest.fn(),
    };

    const sendMock = jest.fn().mockResolvedValue({ id: 'msg_1' });
    const MailerMock = jest.fn(() => ({ send: sendMock }));
    const templateMock = jest.fn(() => '<html>template</html>');

    jest.isolateModules(() => {
      jest.doMock('../services/Mailer', () => MailerMock);
      jest.doMock('../services/surveyTemplate', () => templateMock);
      require('../routes/surveyRoutes')(app);
    });

    const req = {
      body: {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
        recipients: ['a@example.com'],
      },
    };
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await routes['/api/surveys/send-email'](req, res);

    expect(templateMock).toHaveBeenCalledWith({
      title: 'Roadmap Pulse',
      subject: 'Q2 Priority',
      body: 'Should we build feature X?',
    });
    expect(MailerMock).toHaveBeenCalledWith(
      {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
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
    const routes = {};
    const app = {
      post: jest.fn((route, handler) => {
        routes[route] = handler;
      }),
      get: jest.fn(),
    };

    const sendMock = jest.fn().mockRejectedValue(new Error('resend down'));
    const MailerMock = jest.fn(() => ({ send: sendMock }));

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.isolateModules(() => {
      jest.doMock('../services/Mailer', () => MailerMock);
      jest.doMock('../services/surveyTemplate', () => () => '<html>template</html>');
      require('../routes/surveyRoutes')(app);
    });

    const req = {
      body: {
        title: 'Roadmap Pulse',
        subject: 'Q2 Priority',
        body: 'Should we build feature X?',
        recipients: ['a@example.com'],
      },
    };
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await routes['/api/surveys/send-email'](req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: 'Failed to send email',
      message: 'resend down',
    });

    errorSpy.mockRestore();
  });
});
