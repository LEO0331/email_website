describe('Backend API', () => {
  test('registers /api/health route and responds with service status', () => {
    const routes = {};
    const app = {
      post: jest.fn(),
      get: jest.fn((path, handler) => {
        routes[path] = handler;
      }),
    };
    const res = { send: jest.fn() };

    require('../routes/surveyRoutes')(app);
    routes['/api/health']({}, res);

    expect(app.get).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({
      status: 'ok',
      message: 'Survey app is running',
    });
  });

  test('POST /api/surveys/send-email rejects missing recipients', async () => {
    const routes = {};
    const app = {
      post: jest.fn((path, handler) => {
        routes[path] = handler;
      }),
      get: jest.fn(),
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    require('../routes/surveyRoutes')(app);

    const req = {
      body: {
        title: 'Test Survey',
        subject: 'Test Subject',
        body: 'Hello world',
      },
    };

    await routes['/api/surveys/send-email'](req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: 'No recipients provided' });
  });

  test('POST /api/surveys/send-email rejects empty recipients array', async () => {
    const routes = {};
    const app = {
      post: jest.fn((path, handler) => {
        routes[path] = handler;
      }),
      get: jest.fn(),
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    require('../routes/surveyRoutes')(app);

    const req = {
      body: {
        title: 'Test Survey',
        subject: 'Test Subject',
        body: 'Hello world',
        recipients: [],
      },
    };

    await routes['/api/surveys/send-email'](req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: 'No recipients provided' });
  });

  test('surveyTemplate uses DOMAIN when provided', () => {
    process.env.DOMAIN = 'https://example.com';
    const surveyTemplate = require('../services/surveyTemplate');

    const html = surveyTemplate({
      title: 'Test Survey',
      subject: 'Test Subject',
      body: 'Body',
      id: '123',
    });

    expect(html).toContain('https://example.com/api/surveys/123/yes');
    expect(html).toContain('https://example.com/api/surveys/123/no');
  });
});
