describe('vercel api adapter', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('exports app instance from app.js', () => {
    const mockApp = { use: jest.fn() };

    jest.isolateModules(() => {
      jest.doMock('../app', () => mockApp);
      const exported = require('../api/[...all].js');
      expect(exported).toBe(mockApp);
    });
  });
});
