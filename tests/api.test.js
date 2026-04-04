const request = require('supertest');
const app = require('../app');

describe('Backend API', () => {
  test('GET /api/health returns service status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      message: 'Survey app is running',
    });
  });

  test('POST /api/surveys/send-email rejects missing recipients', async () => {
    const response = await request(app).post('/api/surveys/send-email').send({
      title: 'Test Survey',
      subject: 'Test Subject',
      body: 'Hello world',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'No recipients provided' });
  });
});
