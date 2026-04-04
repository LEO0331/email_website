const path = require('path');

describe('app module', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('registers json middleware and routes without static fallback when build is missing', () => {
    let expressFactory;
    const registerRoutes = jest.fn();

    jest.isolateModules(() => {
      jest.doMock('dotenv', () => ({ config: jest.fn() }));
      jest.doMock('fs', () => ({ existsSync: jest.fn(() => false) }));
      jest.doMock('../routes/surveyRoutes', () => registerRoutes);
      jest.doMock('express', () => {
        const app = {
          use: jest.fn(),
          get: jest.fn(),
        };

        const express = jest.fn(() => app);
        express.json = jest.fn(() => 'json-mw');
        express.static = jest.fn(() => 'static-mw');
        express.__app = app;

        expressFactory = express;
        return express;
      });

      require('../app');
    });

    const app = expressFactory.__app;
    expect(expressFactory.json).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith('json-mw');
    expect(registerRoutes).toHaveBeenCalledWith(app);
    expect(expressFactory.static).not.toHaveBeenCalled();
    expect(app.get).not.toHaveBeenCalledWith('*', expect.any(Function));
  });

  test('registers static fallback route when build exists', () => {
    let expressFactory;
    const registerRoutes = jest.fn();

    jest.isolateModules(() => {
      jest.doMock('dotenv', () => ({ config: jest.fn() }));
      jest.doMock('fs', () => ({ existsSync: jest.fn(() => true) }));
      jest.doMock('../routes/surveyRoutes', () => registerRoutes);
      jest.doMock('express', () => {
        const app = {
          use: jest.fn(),
          get: jest.fn(),
        };

        const express = jest.fn(() => app);
        express.json = jest.fn(() => 'json-mw');
        express.static = jest.fn(() => 'static-mw');
        express.__app = app;

        expressFactory = express;
        return express;
      });

      require('../app');
    });

    const app = expressFactory.__app;

    expect(expressFactory.static).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith('static-mw');
    expect(app.get).toHaveBeenCalledWith('*', expect.any(Function));

    const fallbackHandler = app.get.mock.calls.find(([route]) => route === '*')[1];
    const res = { sendFile: jest.fn() };

    fallbackHandler({}, res);

    expect(res.sendFile).toHaveBeenCalledTimes(1);
    expect(res.sendFile.mock.calls[0][0]).toBe(path.join(process.cwd(), 'client/build', 'index.html'));
  });
});
