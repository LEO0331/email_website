describe('authRoutes', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('registers current user, login, and logout routes', () => {
    const routes = {};
    const app = {
      get: jest.fn((path, handler) => {
        routes[path] = handler;
      }),
    };

    const getCurrentUser = jest.fn(() => ({ id: 'demo-user' }));
    const loginDemoUser = jest.fn();
    const logoutDemoUser = jest.fn();

    jest.isolateModules(() => {
      jest.doMock('../services/demoStore', () => ({
        getCurrentUser,
        loginDemoUser,
        logoutDemoUser,
      }));
      require('../routes/authRoutes')(app);
    });

    const currentRes = { send: jest.fn() };
    routes['/api/current_user']({}, currentRes);
    expect(currentRes.send).toHaveBeenCalledWith({ id: 'demo-user' });

    const loginRes = { redirect: jest.fn() };
    routes['/auth/google']({}, loginRes);
    expect(loginDemoUser).toHaveBeenCalledTimes(1);
    expect(loginRes.redirect).toHaveBeenCalledWith('/surveys');

    const logoutRes = { redirect: jest.fn() };
    routes['/api/logout']({}, logoutRes);
    expect(logoutDemoUser).toHaveBeenCalledTimes(1);
    expect(logoutRes.redirect).toHaveBeenCalledWith('/signin');
  });
});
