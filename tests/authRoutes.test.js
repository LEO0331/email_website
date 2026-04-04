describe('authRoutes', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('registers current user, login, and logout routes with cookie session', () => {
    const routes = {};
    const app = {
      get: jest.fn((path, handler) => {
        routes[path] = handler;
      }),
    };

    require('../routes/authRoutes')(app);

    const currentRes = { send: jest.fn() };
    routes['/api/current_user']({ headers: {} }, currentRes);
    expect(currentRes.send).toHaveBeenCalledWith(false);

    const authedRes = { send: jest.fn() };
    routes['/api/current_user']({ headers: { cookie: 'demo_auth=1' } }, authedRes);
    expect(authedRes.send).toHaveBeenCalledWith({
      id: 'demo-user',
      name: 'Demo User',
      credits: 5,
    });

    const loginRes = { cookie: jest.fn(), redirect: jest.fn() };
    routes['/auth/google']({}, loginRes);
    expect(loginRes.cookie).toHaveBeenCalledWith(
      'demo_auth',
      '1',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
      })
    );
    expect(loginRes.redirect).toHaveBeenCalledWith('/surveys');

    const logoutRes = { clearCookie: jest.fn(), redirect: jest.fn() };
    routes['/api/logout']({}, logoutRes);
    expect(logoutRes.clearCookie).toHaveBeenCalledWith('demo_auth');
    expect(logoutRes.redirect).toHaveBeenCalledWith('/signin');
  });
});
